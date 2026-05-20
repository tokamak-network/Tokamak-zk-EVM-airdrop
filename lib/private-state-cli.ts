import { getAddress } from "ethers";

import { runCliJson, runCommand } from "@/lib/commands";
import type { AppConfig } from "@/lib/config";

type L1AddressOutput = {
  address?: string;
  l1Address?: string;
};

type TransferOutput = {
  txHash?: string;
  transactionHash?: string;
  payoutTxHash?: string;
  receipt?: {
    hash?: string;
    transactionHash?: string;
  };
  outputNotes?: Array<{
    sourceTxHash?: string;
    createdAtTxHash?: string;
  }>;
};

type WalletMetaOutput = Record<string, unknown>;

export async function preparePrivateStateCli(config: AppConfig): Promise<void> {
  requireRpcUrl(config);

  await runCommand(
    "npm",
    ["install", "-g", "@tokamak-private-dapps/private-state-cli@latest"],
    { timeoutMs: 10 * 60_000 },
  );
  await runCommand("private-state-cli", ["install"], {
    timeoutMs: 60 * 60_000,
  });

  if (config.rpcConfigSource === "env") {
    const rpcArgs = [
      "set",
      "rpc",
      "--network",
      config.network,
      "--rpc-url",
      config.rpcUrl!,
    ];

    if (config.rpcProvider) {
      rpcArgs.push("--provider", config.rpcProvider);
    }

    await runCommand("private-state-cli", rpcArgs, { timeoutMs: 120_000 });
  }

  if (!(await canReadAccountAddress(config))) {
    await runCommand(
      "private-state-cli",
      [
        "account",
        "import",
        "--account",
        config.rewardAccount,
        "--network",
        config.network,
        "--private-key-file",
        config.rewardPrivateKeyFile,
      ],
      { timeoutMs: 120_000 },
    );
  }
}

export async function resolveRewardWalletName(
  config: AppConfig,
): Promise<string> {
  if (config.rewardWallet) {
    return config.rewardWallet;
  }

  const l1Address = await getAccountL1Address(config);

  return `${config.channel}-${l1Address}`;
}

export async function getAccountL1Address(config: AppConfig): Promise<string> {
  const args = [
    "account",
    "get-l1-address",
    "--account",
    config.rewardAccount,
    "--network",
    config.network,
  ];

  try {
    const json = await runCliJson<L1AddressOutput>(args);
    const address = json.address ?? json.l1Address;

    if (address) {
      return getAddress(address);
    }
  } catch {
    // Fall through to human-readable output parsing for older CLI output.
  }

  const stdout = await runCommand("private-state-cli", args);
  const match = stdout.match(/0x[a-fA-F0-9]{40}/);

  if (!match) {
    throw new Error("Could not derive reward account L1 address from CLI output.");
  }

  return getAddress(match[0]);
}

export async function getRewardWalletL2Address(
  config: AppConfig,
  wallet: string,
): Promise<string> {
  const meta = await runCliJson<WalletMetaOutput>([
    "wallet",
    "get-meta",
    "--wallet",
    wallet,
    "--network",
    config.network,
  ]);
  const address = findFirstAddressByKey(meta, [
    "l2Address",
    "registeredL2Address",
    "channelTokenVaultAddress",
    "tonnelChannelAddress",
  ]);

  if (!address) {
    throw new Error("Could not resolve reward wallet L2 address from wallet metadata.");
  }

  return getAddress(address);
}

export async function getWalletNotes(
  config: AppConfig,
  wallet: string,
): Promise<unknown> {
  return runCliJson([
    "wallet",
    "get-notes",
    "--wallet",
    wallet,
    "--network",
    config.network,
  ]);
}

export async function recoverRewardWalletWorkspace(
  config: AppConfig,
): Promise<void> {
  await runCommand(
    "private-state-cli",
    [
      "wallet",
      "recover-workspace",
      "--channel-name",
      config.channel,
      "--network",
      config.network,
      "--account",
      config.rewardAccount,
      "--from-genesis",
    ],
    { timeoutMs: 60 * 60_000 },
  );
}

export async function transferNotes(
  config: AppConfig,
  wallet: string,
  noteIds: string[],
  recipients: string[],
  amounts: string[],
): Promise<string> {
  const output = await runCliJson<TransferOutput>(
    buildTransferNotesArgs(config, wallet, noteIds, recipients, amounts),
    { timeoutMs: 60 * 60_000 },
  );
  const txHash = findTransactionHash(output);

  if (!txHash) {
    throw new Error("private-state-cli wallet transfer-notes did not return a transaction hash.");
  }

  return txHash;
}

export function findTransactionHash(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const directHash = findDirectTransactionHash(record);

  if (directHash) {
    return directHash;
  }

  for (const candidate of Object.values(record)) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const hash = findTransactionHash(item);

        if (hash) {
          return hash;
        }
      }
    } else {
      const hash = findTransactionHash(candidate);

      if (hash) {
        return hash;
      }
    }
  }

  return null;
}

export function buildTransferNotesArgs(
  config: Pick<AppConfig, "network" | "rewardAccount">,
  wallet: string,
  noteIds: string[],
  recipients: string[],
  amounts: string[],
): string[] {
  return [
    "wallet",
    "transfer-notes",
    "--wallet",
    wallet,
    "--network",
    config.network,
    "--note-ids",
    JSON.stringify(noteIds),
    "--recipients",
    JSON.stringify(recipients),
    "--amounts",
    JSON.stringify(amounts),
    "--acknowledge-action-impact",
    "--tx-submitter",
    config.rewardAccount,
  ];
}

function findDirectTransactionHash(record: Record<string, unknown>): string | null {
  for (const key of [
    "txHash",
    "transactionHash",
    "payoutTxHash",
    "hash",
    "sourceTxHash",
    "createdAtTxHash",
  ]) {
    const value = record[key];

    if (typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value)) {
      return value;
    }
  }

  return null;
}

async function canReadAccountAddress(config: AppConfig): Promise<boolean> {
  try {
    await getAccountL1Address(config);
    return true;
  } catch {
    return false;
  }
}

function requireRpcUrl(config: AppConfig): void {
  if (!config.rpcUrl) {
    throw new Error(
      `AIRDROP_RPC_URL is required for the local worker because no RPC_URL was found in ${config.rpcConfigPath}.`,
    );
  }
}

function findFirstAddressByKey(
  value: unknown,
  preferredKeys: string[],
): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const address = findFirstAddressByKey(item, preferredKeys);

      if (address) {
        return address;
      }
    }

    return null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  for (const key of preferredKeys) {
    const candidate = record[key];

    if (typeof candidate === "string" && /^0x[a-fA-F0-9]{40}$/.test(candidate)) {
      return candidate;
    }
  }

  for (const candidate of Object.values(record)) {
    const address = findFirstAddressByKey(candidate, preferredKeys);

    if (address) {
      return address;
    }
  }

  return null;
}
