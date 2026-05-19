import fs from "node:fs";
import path from "node:path";

export function loadLocalEnv(cwd = process.cwd()): void {
  const protectedKeys = new Set(Object.keys(process.env));

  for (const fileName of [".env", ".env.local"]) {
    const filePath = path.join(cwd, fileName);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);

      if (!parsed || protectedKeys.has(parsed.key)) {
        continue;
      }

      process.env[parsed.key] = parsed.value;
    }
  }
}

function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex <= 0) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const rawValue = trimmed.slice(separatorIndex + 1).trim();

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
    return null;
  }

  return {
    key,
    value: unquote(rawValue),
  };
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
