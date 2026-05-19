import path from "node:path";

export type AppConfig = {
  channel: string;
  rewardTon: number;
  totalBudgetTon: number;
  dbPath: string;
  payoutsPaused: boolean;
  operatorToken?: string;
  verifyCommand?: CommandTemplate;
  payoutCommand?: CommandTemplate;
};

export type CommandTemplate = {
  command: string;
  args: string[];
};

export function getConfig(): AppConfig {
  return {
    channel: process.env.AIRDROP_CHANNEL ?? "the-great-first-channel",
    rewardTon: readNumberEnv("AIRDROP_REWARD_TON", 25),
    totalBudgetTon: readNumberEnv("AIRDROP_TOTAL_BUDGET_TON", 1200),
    dbPath: readDbPath(),
    payoutsPaused: process.env.AIRDROP_PAYOUTS_PAUSED === "true",
    operatorToken: process.env.OPERATOR_TOKEN,
    verifyCommand: readCommandTemplate(
      "PRIVATE_STATE_VERIFY_COMMAND",
      "PRIVATE_STATE_VERIFY_ARGS",
    ),
    payoutCommand: readCommandTemplate(
      "PRIVATE_STATE_PAYOUT_COMMAND",
      "PRIVATE_STATE_PAYOUT_ARGS",
    ),
  };
}

function readDbPath(): string {
  if (process.env.AIRDROP_DB_PATH) {
    return path.resolve(
      /* turbopackIgnore: true */ process.env.AIRDROP_DB_PATH,
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

function readCommandTemplate(
  commandName: string,
  argsName: string,
): CommandTemplate | undefined {
  const command = process.env[commandName];

  if (!command) {
    return undefined;
  }

  const argsJson = process.env[argsName] ?? "[]";
  const parsedArgs = JSON.parse(argsJson);

  if (
    !Array.isArray(parsedArgs) ||
    parsedArgs.some((arg) => typeof arg !== "string")
  ) {
    throw new Error(`${argsName} must be a JSON array of strings.`);
  }

  return {
    command,
    args: parsedArgs,
  };
}
