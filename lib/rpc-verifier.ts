import fs from "node:fs";
import path from "node:path";

import {
  getAddress,
  Interface,
  isAddress,
  isHexString,
  JsonRpcProvider,
  ZeroAddress,
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

type AbiCandidate = {
  abi: unknown[];
  source: string;
};

type DecodedChannelTransaction = {
  bridgeInterface: Interface;
  decoded: unknown;
};

export type VerificationTransaction = {
  data: string;
  value: bigint;
  to: string | null;
  from: string;
  blockNumber: number | null;
};

export type VerificationReceipt = {
  status: number | null;
};

export type VerificationBlock = {
  timestamp: number;
};

export type VerificationProvider = {
  getTransaction(txHash: string): Promise<VerificationTransaction | null>;
  getTransactionReceipt(txHash: string): Promise<VerificationReceipt | null>;
  getBlock(blockNumber: number): Promise<VerificationBlock | null>;
  call(transaction: { to: string; data: string }): Promise<string>;
};

export type VerifierDependencies = {
  provider?: VerificationProvider;
  channelManagerInterface?: Interface;
  transferSelectors?: Set<string>;
};

const registrationFunctionName = "getChannelTokenVaultRegistration";
const eligibleTransactionStartTimestamp =
  Date.UTC(2026, 4, 19, 0, 0, 0) / 1000;

export async function verifySubmittedTransaction(
  config: AppConfig,
  txHash: string,
  dependencies: VerifierDependencies = {},
): Promise<VerificationResult> {
  if (!config.rpcUrl) {
    throw new Error(
      `AIRDROP_RPC_URL is required for RPC verification because no RPC_URL was found in ${config.rpcConfigPath}.`,
    );
  }

  if (!isHexString(txHash, 32)) {
    return { valid: false, reason: "Submitted value is not a transaction hash." };
  }

  const provider = dependencies.provider ?? new JsonRpcProvider(config.rpcUrl);
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

  const channelManagerInterfaces = dependencies.channelManagerInterface
    ? [dependencies.channelManagerInterface]
    : loadChannelManagerInterfaces(config.cliArtifactDir);
  let decodedTransaction: DecodedChannelTransaction;

  try {
    decodedTransaction = decodeChannelTransaction(
      channelManagerInterfaces,
      transaction,
    );
  } catch {
    return { valid: false, reason: "Transaction calldata is not executeChannelTransaction." };
  }

  const functionSig = normalizeSelector(extractFunctionSig(decodedTransaction.decoded));

  if (!functionSig) {
    return { valid: false, reason: "Could not read private-state function selector from transaction metadata." };
  }

  const transferSelectors =
    dependencies.transferSelectors ??
    loadTransferNoteSelectors(config.cliArtifactDir);

  if (!transferSelectors.has(functionSig)) {
    return { valid: false, reason: "Transaction is not a private-state transfer notes transaction." };
  }

  if (transaction.blockNumber === null) {
    return { valid: false, reason: "Transaction block number is missing." };
  }

  const block = await provider.getBlock(transaction.blockNumber);

  if (!block) {
    return { valid: false, reason: "Transaction block was not found by RPC." };
  }

  if (block.timestamp < eligibleTransactionStartTimestamp) {
    return {
      valid: false,
      reason: "Transaction is outside the eligible event window.",
    };
  }

  const resolvedL1Address = getAddress(transaction.from);
  const resolvedL2Address = await readCurrentRegisteredL2Address(
    config,
    provider,
    decodedTransaction.bridgeInterface,
    resolvedL1Address,
  );

  if (!resolvedL2Address) {
    return {
      valid: false,
      reason: "Transaction submitter is not currently registered in Tonnel.",
    };
  }

  return {
    valid: true,
    resolvedL1Address,
    resolvedL2Address,
  };
}

function loadChannelManagerInterfaces(artifactDir: string): Interface[] {
  const candidates = loadAbiCandidates(artifactDir);
  const interfaces: Interface[] = [];

  for (const candidate of candidates) {
    try {
      const bridgeInterface = new Interface(candidate.abi as ConstructorParameters<typeof Interface>[0]);

      if (
        hasFunctionNamed(bridgeInterface, "executeChannelTransaction") &&
        hasFunctionNamed(bridgeInterface, registrationFunctionName)
      ) {
        interfaces.push(bridgeInterface);
      }
    } catch {
      continue;
    }
  }

  if (interfaces.length > 0) {
    return interfaces;
  }

  throw new Error(
    `Could not find channel manager ABI with executeChannelTransaction and ${registrationFunctionName} under ${artifactDir}.`,
  );
}

function decodeChannelTransaction(
  bridgeInterfaces: Interface[],
  transaction: VerificationTransaction,
): DecodedChannelTransaction {
  for (const bridgeInterface of bridgeInterfaces) {
    try {
      const parsed = bridgeInterface.parseTransaction({
        data: transaction.data,
        value: transaction.value,
      });

      if (parsed?.name === "executeChannelTransaction") {
        return {
          bridgeInterface,
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

type ChannelTokenVaultRegistration = {
  exists?: boolean;
  l2Address?: string;
  [index: number]: unknown;
};

async function readCurrentRegisteredL2Address(
  config: AppConfig,
  provider: VerificationProvider,
  bridgeInterface: Interface,
  l1Address: string,
): Promise<string | null> {
  const encodedRegistration = await provider.call({
    to: config.channelManagerAddress,
    data: bridgeInterface.encodeFunctionData(registrationFunctionName, [l1Address]),
  });
  const decoded = bridgeInterface.decodeFunctionResult(
    registrationFunctionName,
    encodedRegistration,
  );
  const registration = decoded[0] as ChannelTokenVaultRegistration;
  const exists = Boolean(registration.exists ?? registration[0]);
  const l2Address = registration.l2Address ?? registration[1];

  if (!exists || typeof l2Address !== "string" || !isAddress(l2Address)) {
    return null;
  }

  if (getAddress(l2Address) === ZeroAddress) {
    return null;
  }

  return getAddress(l2Address);
}

function hasFunctionNamed(abiInterface: Interface, name: string): boolean {
  return abiInterface.fragments.some(
    (fragment) =>
      fragment.type === "function" &&
      "name" in fragment &&
      fragment.name === name,
  );
}

function normalizeSelector(value: string | null): string | null {
  if (!value || !isHexString(value, 4)) {
    return null;
  }

  return value.toLowerCase();
}

function collectTransferSelectors(value: unknown, selectors: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectTransferSelectors(item, selectors);
    }

    if (isAbiFragmentArray(value)) {
      try {
        const abiInterface = new Interface(
          value as ConstructorParameters<typeof Interface>[0],
        );
        for (const fragment of abiInterface.fragments) {
          if (
            fragment.type === "function" &&
            "name" in fragment &&
            isTransferNotesFunctionName(String(fragment.name)) &&
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

  return functionName ? isTransferNotesFunctionName(functionName) : false;
}

function isTransferNotesFunctionName(value: string): boolean {
  return /^transferNotes\d+To\d+$/.test(value);
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
    if (isAbiFragmentArray(value)) {
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

    if (Array.isArray(candidate) && isAbiFragmentArray(candidate)) {
      candidates.push({ abi: candidate, source });
    }
  }

  for (const item of Object.values(record)) {
    collectAbiCandidates(item, source, candidates);
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
