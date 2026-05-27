import fs from "node:fs";
import path from "node:path";

const runtimeDir = process.argv[2] ?? process.cwd();
const databaseOrigin = readDatabaseOrigin(runtimeDir);

if (!databaseOrigin) {
  process.exit(0);
}

for (let attempt = 1; attempt <= 60; attempt += 1) {
  if (await canReach(databaseOrigin)) {
    process.exit(0);
  }

  console.error(`Waiting for database network before worker run (${attempt}/60).`);
  await sleep(10_000);
}

console.error("Database network preflight failed after 10 minutes.");
process.exit(75);

function readDatabaseOrigin(cwd) {
  const env = { ...process.env };

  for (const fileName of [".env", ".env.local"]) {
    const filePath = path.join(cwd, fileName);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const parsed = parseEnvLine(line);

      if (parsed && !env[parsed.key]) {
        env[parsed.key] = parsed.value;
      }
    }
  }

  if (!env.DATABASE_URL) {
    return null;
  }

  const url = new URL(env.DATABASE_URL);
  return `https://${url.hostname}`;
}

function parseEnvLine(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex <= 0) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = unquote(trimmed.slice(separatorIndex + 1).trim());

  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? { key, value } : null;
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

async function canReach(origin) {
  try {
    await fetch(origin, { signal: AbortSignal.timeout(5000) });
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
