import fs from "node:fs";

const [
  ,
  ,
  hostName,
  timestamp,
  exitCode,
  repoDir,
  runtimeDir,
  logDir,
  stderrLog,
  stdoutLog,
  runStdout,
  runStderr,
] = process.argv;

const env = {
  ...readEnvFile(`${runtimeDir}/.env`),
  ...readEnvFile(`${runtimeDir}/.env.local`),
};
const botToken = env.AIRDROP_TELEGRAM_BOT_TOKEN;
const chatId = env.AIRDROP_TELEGRAM_CHAT_ID;
const dryRun = process.env.AIRDROP_TELEGRAM_DRY_RUN === "true";

if ((!botToken || !chatId) && !dryRun) {
  console.error(
    "Telegram alert skipped: AIRDROP_TELEGRAM_BOT_TOKEN and AIRDROP_TELEGRAM_CHAT_ID are not both set.",
  );
  process.exit(0);
}

const succeeded = exitCode === "0";
const summary = readWorkerSummary(runStdout);
const errorTail = succeeded ? "" : readTail(runStderr, 1600);

const lines = [
  `Tonnel airdrop worker ${succeeded ? "succeeded" : "failed"}`,
  `Host: ${hostName}`,
  `Time: ${timestamp}`,
  `Exit: ${exitCode}`,
  `Source repo: ${repoDir}`,
  `Runtime: ${runtimeDir}`,
];

if (summary) {
  lines.push(
    `Verified: ${summary.verified}`,
    `Transferred: ${summary.transferred}`,
    `Failed: ${summary.failed}`,
    `Skipped payouts: ${summary.skippedPayouts}`,
    `Remaining budget: ${summary.remainingBudgetTon ?? "unknown"} TON`,
  );

  if (summary.failureReasons) {
    lines.push(
      `Reward channel address unresolved: ${summary.failureReasons.reward_channel_address_unresolved ?? 0}`,
      `Invalid submission transaction: ${summary.failureReasons.invalid_submission_transaction ?? 0}`,
      `Reward budget exhausted: ${summary.failureReasons.reward_budget_exhausted ?? 0}`,
      `Duplicate transaction: ${summary.failureReasons.duplicate_transaction ?? 0}`,
      `Duplicate channel account: ${summary.failureReasons.duplicate_channel_account ?? 0}`,
      `Internal payout error: ${summary.failureReasons.internal_payout_error ?? 0}`,
    );
  }
}

if (errorTail) {
  lines.push("", "Error:", errorTail);
}

lines.push("", `Logs: ${logDir}`, `stderr: ${stderrLog}`, `stdout: ${stdoutLog}`);

if (dryRun) {
  console.log(lines.join("\n"));
  process.exit(0);
}

try {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        chat_id: chatId,
        text: lines.join("\n"),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Telegram alert failed: ${response.status} ${await response.text()}`,
    );
  }
} catch (error) {
  console.error(
    `Telegram alert failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
}

function readWorkerSummary(path) {
  if (!path || !fs.existsSync(path)) {
    return null;
  }

  const text = fs.readFileSync(path, "utf8");
  let latestSummary = null;

  for (const candidate of extractJsonObjects(text)) {
    try {
      const parsed = JSON.parse(candidate);

      if (isWorkerSummary(parsed)) {
        latestSummary = parsed;
      }
    } catch {
      continue;
    }
  }

  return latestSummary;
}

function extractJsonObjects(text) {
  const objects = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === "{") {
      if (depth === 0) {
        start = index;
      }

      depth += 1;
      continue;
    }

    if (character === "}" && depth > 0) {
      depth -= 1;

      if (depth === 0 && start >= 0) {
        objects.push(text.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return objects;
}

function isWorkerSummary(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    Number.isInteger(value.verified) &&
    Number.isInteger(value.transferred) &&
    Number.isInteger(value.failed) &&
    Number.isInteger(value.skippedPayouts)
  );
}

function readTail(path, maxLength) {
  if (!path || !fs.existsSync(path)) {
    return "";
  }

  const text = fs.readFileSync(path, "utf8").trim();
  return text.length > maxLength ? text.slice(text.length - maxLength) : text;
}

function readEnvFile(path) {
  if (!fs.existsSync(path)) {
    return {};
  }

  const env = {};

  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = unquote(trimmed.slice(separatorIndex + 1).trim());

    if (/^[A-Z_][A-Z0-9_]*$/.test(key)) {
      env[key] = value;
    }
  }

  return env;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
