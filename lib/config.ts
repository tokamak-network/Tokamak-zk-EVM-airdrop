import fs from "node:fs";
import path from "node:path";

export type AppConfig = {
  channel: string;
  network: string;
  rewardTon: number;
  totalBudgetTon: number;
  dbPath: string;
  payoutsPaused: boolean;
  operatorToken?: string;
  rpcUrl?: string;
  rpcProvider?: string;
  rpcConfigPath: string;
  rpcConfigSource: "env" | "file" | "missing";
  rpcBlockRangeCap: number;
  channelGenesisBlock: number;
  channelManagerAddress: string;
  cliArtifactDir: string;
  rewardAccount: string;
  rewardPrivateKeyFile: string;
  rewardWallet?: string;
};

export type CommandTemplate = {
  command: string;
  args: string[];
};

export function getConfig(): AppConfig {
  const network = process.env.AIRDROP_NETWORK ?? "mainnet";
  const rpcConfig = readRpcConfig(network);
  const rpcUrl = process.env.AIRDROP_RPC_URL ?? rpcConfig.RPC_URL;
  const defaultCliArtifactDir = resolveCliArtifactDir();

  return {
    channel: process.env.AIRDROP_CHANNEL ?? "the-great-first-channel",
    network,
    rewardTon: readNumberEnv("AIRDROP_REWARD_TON", 25),
    totalBudgetTon: readNumberEnv("AIRDROP_TOTAL_BUDGET_TON", 5000),
    dbPath: readDbPath(),
    payoutsPaused: process.env.AIRDROP_PAYOUTS_PAUSED === "true",
    operatorToken: process.env.OPERATOR_TOKEN,
    rpcUrl,
    rpcProvider: process.env.AIRDROP_RPC_PROVIDER,
    rpcConfigPath: rpcConfig.path,
    rpcConfigSource: process.env.AIRDROP_RPC_URL
      ? "env"
      : rpcUrl
        ? "file"
        : "missing",
    rpcBlockRangeCap: readNumberEnv(
      "AIRDROP_RPC_BLOCK_RANGE_CAP",
      readPositiveNumber(rpcConfig.RPC_BLOCK_RANGE_CAP, 1000),
    ),
    channelGenesisBlock: readNumberEnv("AIRDROP_CHANNEL_GENESIS_BLOCK", 25018368),
    channelManagerAddress:
      process.env.AIRDROP_CHANNEL_MANAGER_ADDRESS ??
      "0x3108d92A38bFb4B3396DE7ad4D92318a8fbE61D7",
    cliArtifactDir:
      process.env.AIRDROP_CLI_ARTIFACT_DIR ?? defaultCliArtifactDir,
    rewardAccount: process.env.AIRDROP_REWARD_ACCOUNT ?? "account2",
    rewardPrivateKeyFile: resolveHomePath(
      process.env.AIRDROP_REWARD_PRIVATE_KEY_FILE ??
        "~/user-secrets/account2.key",
    ),
    rewardWallet: process.env.AIRDROP_REWARD_WALLET,
  };
}

function resolveCliArtifactDir(): string {
  const localCliArtifactDir = path.join(
    process.env.HOME ?? process.cwd(),
    "tokamak-private-channels",
    "dapps",
    "private-state",
    "chain-id-1",
  );

  if (fs.existsSync(localCliArtifactDir)) {
    return localCliArtifactDir;
  }

  return path.join(process.cwd(), "private-state-artifacts", "chain-id-1");
}

function readRpcConfig(network: string): Record<string, string> & { path: string } {
  const configPath = path.join(
    process.env.HOME ?? "",
    "tokamak-private-channels",
    "workspace",
    network,
    "rpc-config.env",
  );

  if (!fs.existsSync(configPath)) {
    return { path: configPath };
  }

  const values: Record<string, string> = { path: configPath };

  for (const line of fs.readFileSync(configPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (/^[A-Z_][A-Z0-9_]*$/.test(key)) {
      values[key] = unquote(value);
    }
  }

  return values as Record<string, string> & { path: string };
}

function readDbPath(): string {
  if (process.env.AIRDROP_DB_PATH) {
    return path.resolve(
      /* turbopackIgnore: true */ resolveHomePath(process.env.AIRDROP_DB_PATH),
    );
  }

  return path.join(process.cwd(), "data", "airdrop.sqlite");
}

function readNumberEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }

  return value;
}

function readPositiveNumber(rawValue: string | undefined, fallback: number): number {
  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
}

function resolveHomePath(value: string): string {
  if (value === "~") {
    return process.env.HOME ?? value;
  }

  if (value.startsWith("~/")) {
    return path.join(process.env.HOME ?? "", value.slice(2));
  }

  return value;
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
