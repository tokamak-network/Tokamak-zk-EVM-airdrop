import fs from "node:fs";

const [
  ,
  ,
  hostName,
  timestamp,
  exitCode,
  repoDir,
  stderrLog,
  stdoutLog,
] = process.argv;

const env = readEnvFile(`${repoDir}/.env.local`);
const botToken = env.AIRDROP_TELEGRAM_BOT_TOKEN;
const chatId = env.AIRDROP_TELEGRAM_CHAT_ID;

if (!botToken || !chatId) {
  console.error(
    "Telegram alert skipped: AIRDROP_TELEGRAM_BOT_TOKEN and AIRDROP_TELEGRAM_CHAT_ID are not both set.",
  );
  process.exit(0);
}

const text = [
  "Tonnel airdrop worker failed",
  `Host: ${hostName}`,
  `Time: ${timestamp}`,
  `Exit: ${exitCode}`,
  `Repo: ${repoDir}`,
  `stderr: ${stderrLog}`,
  `stdout: ${stdoutLog}`,
].join("\n");

const response = await fetch(
  `https://api.telegram.org/bot${botToken}/sendMessage`,
  {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      chat_id: chatId,
      text,
    }),
  },
);

if (!response.ok) {
  throw new Error(
    `Telegram alert failed: ${response.status} ${await response.text()}`,
  );
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
