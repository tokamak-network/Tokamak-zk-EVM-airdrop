import fs from "node:fs";
import path from "node:path";

import {
  type EventLog,
  getAddress,
  Interface,
  isAddress,
  isHexString,
  JsonRpcProvider,
  type Log,
  type TransactionResponse,
  zeroPadValue,
} from "ethers";

import type { AppConfig } from "@/lib/config";

export type VerificationResult =
  | {
      valid: true;
      resolvedL1Address: string;
      resolvedL2Address: string;
    }
  | {
      valid: false;
      reason: string;
    };

type ParticipationEvent = {
  type: "registered" | "exited";
  blockNumber: number;
  transactionIndex: number;
  logIndex: number;
  l1Address: string;
  l2Address: string | null;
};

type AbiCandidate = {
  abi: unknown[];
  source: string;
};

const registeredEventName = "ChannelTokenVaultIdentityRegistered";
const exitedEventName = "ChannelTokenVaultIdentityExited";

export async function verifySubmittedTransaction(
  config: AppConfig,
  txHash: string,
): Promise<VerificationResult> {
  if (!config.rpcUrl) {
    throw new Error("AIRDROP_RPC_URL is required for RPC verification.");
  }

  if (!isHexString(txHash, 32)) {
    return { valid: false, reason: "Submitted value is not a transaction hash." };
  }

  const provider = new JsonRpcProvider(config.rpcUrl);
  const transaction = await provider.getTransaction(txHash);

  if (!transaction) {
    return { valid: false, reason: "Transaction was not found by RPC." };
  }

  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) {
    return { valid: false, reason: "Transaction receipt was not found by RPC." };
  }

  if (receipt.status !== 1) {
    return { valid: false, reason: "Transaction did not succeed." };
  }

  if (!transaction.to) {
    return { valid: false, reason: "Transaction does not call a contract." };
  }

  if (
    getAddress(transaction.to) !== getAddress(config.channelManagerAddress)
  ) {
    return { valid: false, reason: "Transaction was not sent to Tonnel channel manager." };
  }

  const channelManagerInterface = loadChannelManagerInterface(config.cliArtifactDir);
  const decoded = decodeChannelTransaction(channelManagerInterface, transaction);
  const functionSig = normalizeSelector(findFunctionSig(decoded));

  if (!functionSig) {
    return { valid: false, reason: "Could not read private-state function selector from transaction metadata." };
  }

  const transferSelectors = loadTransferNoteSelectors(config.cliArtifactDir);

  if (!transferSelectors.has(functionSig)) {
    return { valid: false, reason: "Transaction is not a private-state transfer notes transaction." };
  }

  if (transaction.blockNumber === null) {
    return { valid: false, reason: "Transaction block number is missing." };
  }

  const resolvedL1Address = getAddress(transaction.from);
  const resolvedL2Address = await resolveL2AddressAtBlock(
    config,
    provider,
    channelManagerInterface,
    resolvedL1Address,
    transaction.blockNumber,
  );

  if (!resolvedL2Address) {
    return {
      valid: false,
      reason: "Transaction submitter was not a Tonnel participant when the transaction happened.",
    };
  }

  return {
    valid: true,
    resolvedL1Address,
    resolvedL2Address,
  };
}

function loadChannelManagerInterface(artifactDir: string): Interface {
  const candidates = loadAbiCandidates(artifactDir);

  for (const candidate of candidates) {
    try {
      const bridgeInterface = new Interface(candidate.abi as ConstructorParameters<typeof Interface>[0]);

      bridgeInterface.getFunction("executeChannelTransaction");
      bridgeInterface.getEvent(registeredEventName);
      bridgeInterface.getEvent(exitedEventName);

      return bridgeInterface;
    } catch {
      continue;
    }
  }

  throw new Error(
    `Could not find channel manager ABI with executeChannelTransaction and participation events under ${artifactDir}.`,
  );
}

function decodeChannelTransaction(
  bridgeInterface: Interface,
  transaction: TransactionResponse,
): unknown {
  const parsed = bridgeInterface.parseTransaction({
    data: transaction.data,
    value: transaction.value,
  });

  if (!parsed || parsed.name !== "executeChannelTransaction") {
    throw new Error("Transaction calldata is not executeChannelTransaction.");
  }

  return parsed.args;
}

function loadTransferNoteSelectors(artifactDir: string): Set<string> {
  const selectors = new Set<string>();

  for (const filePath of listJsonFiles(artifactDir)) {
    const json = readJsonFile(filePath);
    collectTransferSelectors(json, selectors);
  }

  if (selectors.size === 0) {
    throw new Error(
      `Could not derive transfer notes function selectors from private-state artifacts under ${artifactDir}.`,
    );
  }

  return selectors;
}

async function resolveL2AddressAtBlock(
  config: AppConfig,
  provider: JsonRpcProvider,
  bridgeInterface: Interface,
  l1Address: string,
  blockNumber: number,
): Promise<string | null> {
  const events = await loadParticipationEvents(
    config,
    provider,
    bridgeInterface,
    l1Address,
    blockNumber,
  );
  let activeL2Address: string | null = null;

  for (const event of events) {
    if (event.blockNumber > blockNumber) {
      break;
    }

    if (event.type === "registered") {
      activeL2Address = event.l2Address;
      continue;
    }

    activeL2Address = null;
  }

  return activeL2Address;
}

async function loadParticipationEvents(
  config: AppConfig,
  provider: JsonRpcProvider,
  bridgeInterface: Interface,
  l1Address: string,
  toBlock: number,
): Promise<ParticipationEvent[]> {
  const registeredLogs = await loadEventLogs(
    config,
    provider,
    bridgeInterface,
    registeredEventName,
    l1Address,
    toBlock,
  );
  const exitedLogs = await loadEventLogs(
    config,
    provider,
    bridgeInterface,
    exitedEventName,
    l1Address,
    toBlock,
  );
  const events = [...registeredLogs, ...exitedLogs]
    .map((log) => parseParticipationLog(bridgeInterface, log, l1Address))
    .filter((event): event is ParticipationEvent => event !== null)
    .sort((left, right) => {
      if (left.blockNumber !== right.blockNumber) {
        return left.blockNumber - right.blockNumber;
      }

      if (left.transactionIndex !== right.transactionIndex) {
        return left.transactionIndex - right.transactionIndex;
      }

      return left.logIndex - right.logIndex;
    });

  return events;
}

async function loadEventLogs(
  config: AppConfig,
  provider: JsonRpcProvider,
  bridgeInterface: Interface,
  eventName: string,
  l1Address: string,
  toBlock: number,
): Promise<Log[]> {
  const event = bridgeInterface.getEvent(eventName);

  if (!event) {
    throw new Error(`Channel manager ABI is missing ${eventName}.`);
  }

  const topics = [event.topicHash] as Array<string | string[] | null>;
  const l1InputIndex = event.inputs.findIndex((input) => input.name === "l1Address");

  if (l1InputIndex >= 0 && event.inputs[l1InputIndex].indexed) {
    const topicPosition =
      event.inputs
        .slice(0, l1InputIndex)
        .filter((input) => input.indexed).length + 1;

    while (topics.length <= topicPosition) {
      topics.push(null);
    }

    topics[topicPosition] = zeroPadValue(l1Address, 32);
  }

  const logs: Log[] = [];
  const startBlock = config.channelGenesisBlock;
  const chunkSize = Math.max(Math.trunc(config.rpcBlockRangeCap), 1);

  for (let fromBlock = startBlock; fromBlock <= toBlock; fromBlock += chunkSize) {
    const chunkToBlock = Math.min(fromBlock + chunkSize - 1, toBlock);

    logs.push(
      ...(await provider.getLogs({
        address: config.channelManagerAddress,
        fromBlock,
        toBlock: chunkToBlock,
        topics,
      })),
    );
  }

  return logs;
}

function parseParticipationLog(
  bridgeInterface: Interface,
  log: Log | EventLog,
  expectedL1Address: string,
): ParticipationEvent | null {
  const parsed = bridgeInterface.parseLog({
    topics: [...log.topics],
    data: log.data,
  });

  if (!parsed) {
    return null;
  }

  const l1Address = findAddressArg(parsed.args, "l1Address");

  if (!l1Address || getAddress(l1Address) !== getAddress(expectedL1Address)) {
    return null;
  }

  if (parsed.name === registeredEventName) {
    const l2Address = findAddressArg(parsed.args, "l2Address");

    if (!l2Address) {
      return null;
    }

    return {
      type: "registered",
      blockNumber: log.blockNumber,
      transactionIndex: log.transactionIndex,
      logIndex: log.index,
      l1Address: getAddress(l1Address),
      l2Address: getAddress(l2Address),
    };
  }

  if (parsed.name === exitedEventName) {
    return {
      type: "exited",
      blockNumber: log.blockNumber,
      transactionIndex: log.transactionIndex,
      logIndex: log.index,
      l1Address: getAddress(l1Address),
      l2Address: null,
    };
  }

  return null;
}

function findFunctionSig(value: unknown): string | null {
  if (typeof value === "string") {
    return null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of ["functionSig", "functionSelector", "selector"]) {
    const candidate = record[key];

    if (typeof candidate === "string" && isHexString(candidate)) {
      return candidate;
    }
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFunctionSig(item);

      if (found) {
        return found;
      }
    }

    return null;
  }

  for (const item of Object.values(record)) {
    const found = findFunctionSig(item);

    if (found) {
      return found;
    }
  }

  return null;
}

function normalizeSelector(value: string | null): string | null {
  if (!value || !isHexString(value) || value.length < 10) {
    return null;
  }

  return value.slice(0, 10).toLowerCase();
}

function collectTransferSelectors(value: unknown, selectors: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectTransferSelectors(item, selectors);
    }

    try {
      const abiInterface = new Interface(value as ConstructorParameters<typeof Interface>[0]);
      const transferFunction = abiInterface.fragments.find(
        (fragment) =>
          fragment.type === "function" &&
          "name" in fragment &&
          /transfernotes/i.test(String(fragment.name)),
      );

      if (transferFunction && "selector" in transferFunction) {
        selectors.add(String(transferFunction.selector).toLowerCase());
      }
    } catch {
      // Not an ABI array.
    }

    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  const serialized = JSON.stringify(record).toLowerCase();

  if (serialized.includes("transfernotes")) {
    collectHexSelectors(record, selectors);
  }

  for (const item of Object.values(record)) {
    collectTransferSelectors(item, selectors);
  }
}

function collectHexSelectors(value: unknown, selectors: Set<string>): void {
  if (typeof value === "string") {
    const selector = normalizeSelector(value);

    if (selector && value.length === 10) {
      selectors.add(selector);
    }

    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectHexSelectors(item, selectors);
    }

    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const item of Object.values(value)) {
    collectHexSelectors(item, selectors);
  }
}

function findAddressArg(args: unknown, key: string): string | null {
  if (Array.isArray(args)) {
    const named = (args as unknown as Record<string, unknown>)[key];

    if (typeof named === "string" && isAddress(named)) {
      return named;
    }

    for (const item of args) {
      const found = findAddressArg(item, key);

      if (found) {
        return found;
      }
    }
  }

  if (!args || typeof args !== "object") {
    return null;
  }

  const record = args as Record<string, unknown>;
  const candidate = record[key];

  if (typeof candidate === "string" && isAddress(candidate)) {
    return candidate;
  }

  for (const item of Object.values(record)) {
    const found = findAddressArg(item, key);

    if (found) {
      return found;
    }
  }

  return null;
}

function loadAbiCandidates(artifactDir: string): AbiCandidate[] {
  const candidates: AbiCandidate[] = [];

  for (const filePath of listJsonFiles(artifactDir)) {
    const json = readJsonFile(filePath);

    collectAbiCandidates(json, filePath, candidates);
  }

  return candidates;
}

function collectAbiCandidates(
  value: unknown,
  source: string,
  candidates: AbiCandidate[],
): void {
  if (Array.isArray(value)) {
    if (
      value.some(
        (item) =>
          item &&
          typeof item === "object" &&
          "type" in item &&
          "name" in item,
      )
    ) {
      candidates.push({ abi: value, source });
    }

    for (const item of value) {
      collectAbiCandidates(item, source, candidates);
    }

    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;

  for (const key of ["abi", "channelManagerAbi", "bridgeAbi"]) {
    const candidate = record[key];

    if (Array.isArray(candidate)) {
      candidates.push({ abi: candidate, source });
    }
  }

  for (const item of Object.values(record)) {
    collectAbiCandidates(item, source, candidates);
  }
}

function listJsonFiles(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`CLI artifact directory does not exist: ${rootDir}`);
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listJsonFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(entryPath);
    }
  }

  return files;
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
