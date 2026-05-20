import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  getAddress,
  Interface,
  type InterfaceAbi,
  isAddress,
  isHexString,
  JsonRpcProvider,
  zeroPadValue,
} from "ethers";

import type { AppConfig } from "@/lib/config";
import { getConfig } from "@/lib/config";
import { loadLocalEnv } from "@/lib/load-env";

type AuditTransaction = {
  txHash: string;
  sourceLogAddresses: string[];
  transactionFound: boolean;
  receiptFound: boolean;
  receiptStatus: number | null;
  receiptSucceeded: boolean;
  to: string | null;
  from: string | null;
  blockNumber: number | null;
  sentToChannelManager: boolean;
  decodedExecuteChannelTransaction: boolean;
  decodedAbiIndex: number | null;
  functionSig: string | null;
  transferNotesSelector: boolean;
  blockTimestamp: number | null;
  blockTimestampIso: string | null;
  eligibleStartTimestamp: number;
  eligibleStartTimestampIso: string;
  withinEligibleWindow: boolean | null;
  resolvedL2Address: string | null;
  participantAtBlock: boolean | null;
  valid: boolean;
  rejectionReason: string | null;
};

type AuditReport = {
  generatedAt: string;
  network: string;
  fromBlock: number;
  toBlock: number;
  rpcBlockRangeCap: number;
  channelManagerAddress: string;
  auditedContracts: string[];
  contractLogCounts: Array<{
    address: string;
    logCount: number;
    uniqueTxCount: number;
  }>;
  summary: {
    totalUniqueTransactions: number;
    valid: number;
    rejected: number;
    rejectionReasons: Record<string, number>;
  };
  transactions: AuditTransaction[];
};

type AuditLog = {
  address: string;
  topics: readonly string[];
  data: string;
  blockNumber: number;
  transactionIndex: number;
  index: number;
  transactionHash: string;
};

type ParticipationEvent = {
  type: "registered" | "exited";
  blockNumber: number;
  transactionIndex: number;
  logIndex: number;
  l2Address: string | null;
};

type DecodedChannelTransaction = {
  bridgeInterface: Interface;
  interfaceIndex: number;
  decoded: unknown;
};

const bridgeVaultAddress = "0xf127Aef661c815ad46c5159146078f6F1E9f5F61";
const registeredEventName = "ChannelTokenVaultIdentityRegistered";
const exitedEventName = "ChannelTokenVaultIdentityExited";
const eligibleTransactionStartTimestamp =
  Date.UTC(2026, 4, 19, 0, 0, 0) / 1000;

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main(): Promise<void> {
  loadLocalEnv();

  const config = getConfig();

  if (!config.rpcUrl) {
    throw new Error(`RPC URL is missing. Checked ${config.rpcConfigPath}.`);
  }

  const provider = new JsonRpcProvider(config.rpcUrl);
  const channelManagerAddress = getAddress(config.channelManagerAddress);
  const auditedContracts = [
    channelManagerAddress,
    getAddress(bridgeVaultAddress),
  ];
  const toBlock = await provider.getBlockNumber();
  const fromBlock = config.channelGenesisBlock;
  const rpcBlockRangeCap = Math.max(Math.trunc(config.rpcBlockRangeCap), 1);
  const sourceTxs = await collectSourceTransactions(
    provider,
    auditedContracts,
    fromBlock,
    toBlock,
    rpcBlockRangeCap,
  );
  const channelManagerInterfaces = loadChannelManagerInterfaces(config.cliArtifactDir);
  const transferSelectors = loadTransferNoteSelectors(config.cliArtifactDir);
  const participantCache = new Map<string, Promise<string | null>>();
  const transactions: AuditTransaction[] = [];

  for (const [txHash, sourceLogAddresses] of sourceTxs.transactions) {
    transactions.push(
      await auditTransaction({
        config,
        provider,
        txHash,
        sourceLogAddresses: [...sourceLogAddresses].sort(),
        channelManagerAddress,
        channelManagerInterfaces,
        transferSelectors,
        participantCache,
      }),
    );
  }

  transactions.sort((left, right) => {
    const blockDiff = (right.blockNumber ?? -1) - (left.blockNumber ?? -1);

    return blockDiff !== 0 ? blockDiff : left.txHash.localeCompare(right.txHash);
  });

  const report: AuditReport = {
    generatedAt: new Date().toISOString(),
    network: config.network,
    fromBlock,
    toBlock,
    rpcBlockRangeCap,
    channelManagerAddress,
    auditedContracts,
    contractLogCounts: sourceTxs.contractLogCounts,
    summary: summarize(transactions),
    transactions,
  };
  const reportPath = path.join(
    os.tmpdir(),
    `tonnel-verifier-audit-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  );

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(JSON.stringify({
    reportPath,
    summary: report.summary,
    contractLogCounts: report.contractLogCounts,
  }, null, 2));
}

async function collectSourceTransactions(
  provider: JsonRpcProvider,
  addresses: string[],
  fromBlock: number,
  toBlock: number,
  chunkSize: number,
): Promise<{
  transactions: Map<string, Set<string>>;
  contractLogCounts: AuditReport["contractLogCounts"];
}> {
  const transactions = new Map<string, Set<string>>();
  const contractLogCounts: AuditReport["contractLogCounts"] = [];

  for (const address of addresses) {
    const uniqueTxs = new Set<string>();
    let logCount = 0;

    for (let chunkFrom = fromBlock; chunkFrom <= toBlock; chunkFrom += chunkSize) {
      const chunkTo = Math.min(chunkFrom + chunkSize - 1, toBlock);
      const logs = await provider.getLogs({
        address,
        fromBlock: chunkFrom,
        toBlock: chunkTo,
      });

      logCount += logs.length;

      for (const log of logs) {
        uniqueTxs.add(log.transactionHash);

        const sourceLogAddresses =
          transactions.get(log.transactionHash) ?? new Set<string>();

        sourceLogAddresses.add(getAddress(address));
        transactions.set(log.transactionHash, sourceLogAddresses);
      }
    }

    contractLogCounts.push({
      address: getAddress(address),
      logCount,
      uniqueTxCount: uniqueTxs.size,
    });
  }

  return { transactions, contractLogCounts };
}

async function auditTransaction(input: {
  config: AppConfig;
  provider: JsonRpcProvider;
  txHash: string;
  sourceLogAddresses: string[];
  channelManagerAddress: string;
  channelManagerInterfaces: Interface[];
  transferSelectors: Set<string>;
  participantCache: Map<string, Promise<string | null>>;
}): Promise<AuditTransaction> {
  const tx = await input.provider.getTransaction(input.txHash);
  const receipt = await input.provider.getTransactionReceipt(input.txHash);
  const base = createBaseAudit(input.txHash, input.sourceLogAddresses);

  if (!tx) {
    return reject(base, "Transaction was not found by RPC.");
  }

  base.transactionFound = true;
  base.to = tx.to ? getAddress(tx.to) : null;
  base.from = getAddress(tx.from);
  base.blockNumber = tx.blockNumber;

  if (!receipt) {
    return reject(base, "Transaction receipt was not found by RPC.");
  }

  base.receiptFound = true;
  base.receiptStatus = receipt.status;
  base.receiptSucceeded = receipt.status === 1;

  if (!base.receiptSucceeded) {
    return reject(base, "Transaction did not succeed.");
  }

  if (!base.to) {
    return reject(base, "Transaction does not call a contract.");
  }

  base.sentToChannelManager =
    getAddress(base.to) === input.channelManagerAddress;

  if (!base.sentToChannelManager) {
    return reject(base, "Transaction was not sent to Tonnel channel manager.");
  }

  let decoded: DecodedChannelTransaction;

  try {
    decoded = decodeChannelTransaction(
      input.channelManagerInterfaces,
      tx.data,
      tx.value,
    );
  } catch {
    return reject(base, "Transaction calldata is not executeChannelTransaction.");
  }

  base.decodedExecuteChannelTransaction = true;
  base.decodedAbiIndex = decoded.interfaceIndex;
  base.functionSig = normalizeSelector(extractFunctionSig(decoded.decoded));

  if (!base.functionSig) {
    return reject(
      base,
      "Could not read private-state function selector from transaction metadata.",
    );
  }

  base.transferNotesSelector = input.transferSelectors.has(base.functionSig);

  if (!base.transferNotesSelector) {
    return reject(base, "Transaction is not a private-state transfer notes transaction.");
  }

  if (base.blockNumber === null) {
    return reject(base, "Transaction block number is missing.");
  }

  const block = await input.provider.getBlock(base.blockNumber);

  if (!block) {
    return reject(base, "Transaction block was not found by RPC.");
  }

  base.blockTimestamp = block.timestamp;
  base.blockTimestampIso = new Date(block.timestamp * 1000).toISOString();
  base.withinEligibleWindow = block.timestamp >= eligibleTransactionStartTimestamp;

  if (!base.withinEligibleWindow) {
    return reject(base, "Transaction is outside the eligible event window.");
  }

  const participantCacheKey = `${base.from}:${base.blockNumber}`;
  const resolvedL2Address = await getCached(
    input.participantCache,
    participantCacheKey,
    () =>
      resolveL2AddressAtBlock({
        config: input.config,
        provider: input.provider,
        bridgeInterface: decoded.bridgeInterface,
        l1Address: base.from!,
        toBlock: base.blockNumber!,
      }),
  );

  base.resolvedL2Address = resolvedL2Address;
  base.participantAtBlock = resolvedL2Address !== null;

  if (!base.participantAtBlock) {
    return reject(
      base,
      "Transaction submitter was not a Tonnel participant when the transaction happened.",
    );
  }

  base.valid = true;
  return base;
}

function createBaseAudit(
  txHash: string,
  sourceLogAddresses: string[],
): AuditTransaction {
  return {
    txHash,
    sourceLogAddresses,
    transactionFound: false,
    receiptFound: false,
    receiptStatus: null,
    receiptSucceeded: false,
    to: null,
    from: null,
    blockNumber: null,
    sentToChannelManager: false,
    decodedExecuteChannelTransaction: false,
    decodedAbiIndex: null,
    functionSig: null,
    transferNotesSelector: false,
    blockTimestamp: null,
    blockTimestampIso: null,
    eligibleStartTimestamp: eligibleTransactionStartTimestamp,
    eligibleStartTimestampIso: new Date(
      eligibleTransactionStartTimestamp * 1000,
    ).toISOString(),
    withinEligibleWindow: null,
    resolvedL2Address: null,
    participantAtBlock: null,
    valid: false,
    rejectionReason: null,
  };
}

function reject(
  audit: AuditTransaction,
  rejectionReason: string,
): AuditTransaction {
  audit.valid = false;
  audit.rejectionReason = rejectionReason;
  return audit;
}

function summarize(transactions: AuditTransaction[]): AuditReport["summary"] {
  const rejectionReasons: Record<string, number> = {};
  let valid = 0;

  for (const transaction of transactions) {
    if (transaction.valid) {
      valid += 1;
      continue;
    }

    const reason = transaction.rejectionReason ?? "Unknown rejection reason.";

    rejectionReasons[reason] = (rejectionReasons[reason] ?? 0) + 1;
  }

  return {
    totalUniqueTransactions: transactions.length,
    valid,
    rejected: transactions.length - valid,
    rejectionReasons,
  };
}

async function getCached<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  factory: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  const promise = factory();

  cache.set(key, promise);
  return promise;
}

function loadChannelManagerInterfaces(artifactDir: string): Interface[] {
  const interfaces: Interface[] = [];

  for (const candidate of loadAbiCandidates(artifactDir)) {
    try {
      const bridgeInterface = new Interface(candidate as InterfaceAbi);

      if (
        hasFunctionNamed(bridgeInterface, "executeChannelTransaction") &&
        hasEventNamed(bridgeInterface, registeredEventName) &&
        hasEventNamed(bridgeInterface, exitedEventName)
      ) {
        interfaces.push(bridgeInterface);
      }
    } catch {
      continue;
    }
  }

  if (interfaces.length === 0) {
    throw new Error(
      `Could not find channel manager ABI with executeChannelTransaction and participation events under ${artifactDir}.`,
    );
  }

  return interfaces;
}

function decodeChannelTransaction(
  bridgeInterfaces: Interface[],
  data: string,
  value: bigint,
): DecodedChannelTransaction {
  for (const [interfaceIndex, bridgeInterface] of bridgeInterfaces.entries()) {
    try {
      const parsed = bridgeInterface.parseTransaction({ data, value });

      if (parsed?.name === "executeChannelTransaction") {
        return {
          bridgeInterface,
          interfaceIndex,
          decoded: parsed.args,
        };
      }
    } catch {
      continue;
    }
  }

  throw new Error("Transaction calldata is not executeChannelTransaction.");
}

function loadTransferNoteSelectors(artifactDir: string): Set<string> {
  const selectors = new Set<string>();

  for (const filePath of listJsonFiles(artifactDir)) {
    collectTransferSelectors(readJsonFile(filePath), selectors);
  }

  if (selectors.size === 0) {
    throw new Error(
      `Could not derive transfer notes function selectors from private-state artifacts under ${artifactDir}.`,
    );
  }

  return selectors;
}

function collectTransferSelectors(value: unknown, selectors: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectTransferSelectors(item, selectors);
    }

    if (isAbiFragmentArray(value)) {
      try {
        const abiInterface = new Interface(value);

        for (const fragment of abiInterface.fragments) {
          if (
            fragment.type === "function" &&
            "name" in fragment &&
            /^transferNotes\d+To\d+$/.test(String(fragment.name)) &&
            "selector" in fragment
          ) {
            selectors.add(String(fragment.selector).toLowerCase());
          }
        }
      } catch {
        // Not an ABI array.
      }
    }

    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  const functionSig = normalizeSelector(
    typeof record.functionSig === "string" ? record.functionSig : null,
  );

  if (functionSig && hasTransferNotesExampleName(record)) {
    selectors.add(functionSig);
  }

  for (const item of Object.values(record)) {
    collectTransferSelectors(item, selectors);
  }
}

function hasTransferNotesExampleName(record: Record<string, unknown>): boolean {
  const exampleName = record.exampleName;

  if (typeof exampleName === "string" && isTransferNotesExampleName(exampleName)) {
    return true;
  }

  const exampleNames = record.exampleNames;

  return (
    Array.isArray(exampleNames) &&
    exampleNames.some(
      (value) => typeof value === "string" && isTransferNotesExampleName(value),
    )
  );
}

function isTransferNotesExampleName(value: string): boolean {
  const parts = value.split("/").filter(Boolean);
  const functionName = parts[parts.length - 1];

  return functionName ? /^transferNotes\d+To\d+$/.test(functionName) : false;
}

async function resolveL2AddressAtBlock(input: {
  config: AppConfig;
  provider: JsonRpcProvider;
  bridgeInterface: Interface;
  l1Address: string;
  toBlock: number;
}): Promise<string | null> {
  const events = await loadParticipationEvents(input);
  let activeL2Address: string | null = null;

  for (const event of events) {
    if (event.blockNumber > input.toBlock) {
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

async function loadParticipationEvents(input: {
  config: AppConfig;
  provider: JsonRpcProvider;
  bridgeInterface: Interface;
  l1Address: string;
  toBlock: number;
}): Promise<ParticipationEvent[]> {
  const registeredLogs = await loadEventLogs({
    ...input,
    eventName: registeredEventName,
  });
  const exitedLogs = await loadEventLogs({
    ...input,
    eventName: exitedEventName,
  });

  return [...registeredLogs, ...exitedLogs]
    .map((log) => parseParticipationLog(input.bridgeInterface, log, input.l1Address))
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
}

async function loadEventLogs(input: {
  config: AppConfig;
  provider: JsonRpcProvider;
  bridgeInterface: Interface;
  eventName: string;
  l1Address: string;
  toBlock: number;
}): Promise<AuditLog[]> {
  const event = input.bridgeInterface.getEvent(input.eventName);

  if (!event) {
    throw new Error(`Channel manager ABI is missing ${input.eventName}.`);
  }

  const topics = [event.topicHash] as Array<string | string[] | null>;
  const l1InputIndex = event.inputs.findIndex((field) => field.name === "l1Address");

  if (l1InputIndex >= 0 && event.inputs[l1InputIndex].indexed) {
    const topicPosition =
      event.inputs
        .slice(0, l1InputIndex)
        .filter((field) => field.indexed).length + 1;

    while (topics.length <= topicPosition) {
      topics.push(null);
    }

    topics[topicPosition] = zeroPadValue(input.l1Address, 32);
  }

  const logs: AuditLog[] = [];
  const chunkSize = Math.max(Math.trunc(input.config.rpcBlockRangeCap), 1);

  for (
    let fromBlock = input.config.channelGenesisBlock;
    fromBlock <= input.toBlock;
    fromBlock += chunkSize
  ) {
    const toBlock = Math.min(fromBlock + chunkSize - 1, input.toBlock);

    logs.push(
      ...(await input.provider.getLogs({
        address: input.config.channelManagerAddress,
        fromBlock,
        toBlock,
        topics,
      }) as AuditLog[]),
    );
  }

  return logs;
}

function parseParticipationLog(
  bridgeInterface: Interface,
  log: AuditLog,
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

    return l2Address
      ? {
          type: "registered",
          blockNumber: log.blockNumber,
          transactionIndex: log.transactionIndex,
          logIndex: log.index,
          l2Address: getAddress(l2Address),
        }
      : null;
  }

  if (parsed.name === exitedEventName) {
    return {
      type: "exited",
      blockNumber: log.blockNumber,
      transactionIndex: log.transactionIndex,
      logIndex: log.index,
      l2Address: null,
    };
  }

  return null;
}

function extractFunctionSig(decodedArgs: unknown): string | null {
  const functionProof = getTupleValue(decodedArgs, "functionProof", 1);

  if (!functionProof) {
    return null;
  }

  const legacyFunctionSig = getNamedSelector(functionProof, "functionSig");

  if (legacyFunctionSig) {
    return legacyFunctionSig;
  }

  const metadata =
    getTupleValue(functionProof, "metadata", 0) ??
    getTupleValue(functionProof, "functionMetadata", 0);

  if (!metadata) {
    return null;
  }

  return getNamedSelector(metadata, "functionSig") ?? getIndexedSelector(metadata, 1);
}

function getTupleValue(
  value: unknown,
  key: string,
  index: number,
): unknown {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const named = record[key];

  if (named !== undefined) {
    return named;
  }

  return Array.isArray(value) ? value[index] : null;
}

function getNamedSelector(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = (value as Record<string, unknown>)[key];

  return typeof candidate === "string" && isHexString(candidate, 4)
    ? candidate
    : null;
}

function getIndexedSelector(value: unknown, index: number): string | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const candidate = value[index];

  return typeof candidate === "string" && isHexString(candidate, 4)
    ? candidate
    : null;
}

function normalizeSelector(value: string | null): string | null {
  return value && isHexString(value, 4) ? value.toLowerCase() : null;
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

function loadAbiCandidates(artifactDir: string): unknown[][] {
  const candidates: unknown[][] = [];

  for (const filePath of listJsonFiles(artifactDir)) {
    collectAbiCandidates(readJsonFile(filePath), candidates);
  }

  return candidates;
}

function collectAbiCandidates(value: unknown, candidates: unknown[][]): void {
  if (Array.isArray(value)) {
    if (isAbiFragmentArray(value)) {
      candidates.push(value);
    }

    for (const item of value) {
      collectAbiCandidates(item, candidates);
    }

    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;

  for (const key of ["abi", "channelManagerAbi", "bridgeAbi"]) {
    const candidate = record[key];

    if (Array.isArray(candidate) && isAbiFragmentArray(candidate)) {
      candidates.push(candidate);
    }
  }

  for (const item of Object.values(record)) {
    collectAbiCandidates(item, candidates);
  }
}

function isAbiFragmentArray(value: unknown[]): boolean {
  if (value.length === 0) {
    return false;
  }

  const abiFragmentTypes = new Set([
    "constructor",
    "error",
    "event",
    "fallback",
    "function",
    "receive",
  ]);

  return value.every((item) => {
    if (!item || typeof item !== "object" || !("type" in item)) {
      return false;
    }

    const type = (item as { type?: unknown }).type;

    return typeof type === "string" && abiFragmentTypes.has(type);
  });
}

function hasFunctionNamed(abiInterface: Interface, name: string): boolean {
  return abiInterface.fragments.some(
    (fragment) =>
      fragment.type === "function" &&
      "name" in fragment &&
      fragment.name === name,
  );
}

function hasEventNamed(abiInterface: Interface, name: string): boolean {
  return abiInterface.fragments.some(
    (fragment) =>
      fragment.type === "event" &&
      "name" in fragment &&
      fragment.name === name,
  );
}

function listJsonFiles(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`CLI artifact directory does not exist: ${rootDir}`);
  }

  const files: string[] = [];

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
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
