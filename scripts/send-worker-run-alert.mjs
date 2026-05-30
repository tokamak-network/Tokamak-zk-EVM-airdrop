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

if (!botToken || !chatId) {
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
      `Reward L2 address unresolved: ${summary.failureReasons.reward_l2_address_unresolved ?? 0}`,
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
  const start = text.lastIndexOf("{\n");

  if (start < 0) {
    return null;
  }

  try {
    return JSON.parse(text.slice(start));
  } catch {
    return null;
  }
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
