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
  return {
    channel: process.env.AIRDROP_CHANNEL ?? "the-great-first-channel",
    network: process.env.AIRDROP_NETWORK ?? "mainnet",
    rewardTon: readNumberEnv("AIRDROP_REWARD_TON", 25),
    totalBudgetTon: readNumberEnv("AIRDROP_TOTAL_BUDGET_TON", 5000),
    dbPath: readDbPath(),
    payoutsPaused: process.env.AIRDROP_PAYOUTS_PAUSED === "true",
    operatorToken: process.env.OPERATOR_TOKEN,
    rpcUrl: process.env.AIRDROP_RPC_URL,
    rpcProvider: process.env.AIRDROP_RPC_PROVIDER,
    rpcBlockRangeCap: readNumberEnv("AIRDROP_RPC_BLOCK_RANGE_CAP", 1000),
    channelGenesisBlock: readNumberEnv("AIRDROP_CHANNEL_GENESIS_BLOCK", 25018368),
    channelManagerAddress:
      process.env.AIRDROP_CHANNEL_MANAGER_ADDRESS ??
      "0x3108d92A38bFb4B3396DE7ad4D92318a8fbE61D7",
    cliArtifactDir:
      process.env.AIRDROP_CLI_ARTIFACT_DIR ??
      path.join(
        process.env.HOME ?? process.cwd(),
        "tokamak-private-channels",
        "dapps",
        "private-state",
        "chain-id-1",
      ),
    rewardAccount: process.env.AIRDROP_REWARD_ACCOUNT ?? "account2",
    rewardPrivateKeyFile: resolveHomePath(
      process.env.AIRDROP_REWARD_PRIVATE_KEY_FILE ??
        "~/user-secrets/account2.key",
    ),
    rewardWallet: process.env.AIRDROP_REWARD_WALLET,
  };
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

function resolveHomePath(value: string): string {
  if (value === "~") {
    return process.env.HOME ?? value;
  }

  if (value.startsWith("~/")) {
    return path.join(process.env.HOME ?? "", value.slice(2));
  }

  return value;
}
