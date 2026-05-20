import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { closeDb } from "@/lib/db";

export function withTempDb<T>(run: () => T): T {
  closeDb();

  const previousDbPath = process.env.AIRDROP_DB_PATH;
  const dir = mkdtempSync(path.join(tmpdir(), "tonnel-airdrop-test-"));

  process.env.AIRDROP_DB_PATH = path.join(dir, "airdrop.sqlite");

  try {
    return run();
  } finally {
    closeDb();

    if (previousDbPath === undefined) {
      delete process.env.AIRDROP_DB_PATH;
    } else {
      process.env.AIRDROP_DB_PATH = previousDbPath;
    }

    rmSync(dir, { recursive: true, force: true });
  }
}

export async function withTempDbAsync<T>(run: () => Promise<T>): Promise<T> {
  closeDb();

  const previousDbPath = process.env.AIRDROP_DB_PATH;
  const dir = mkdtempSync(path.join(tmpdir(), "tonnel-airdrop-test-"));

  process.env.AIRDROP_DB_PATH = path.join(dir, "airdrop.sqlite");

  try {
    return await run();
  } finally {
    closeDb();

    if (previousDbPath === undefined) {
      delete process.env.AIRDROP_DB_PATH;
    } else {
      process.env.AIRDROP_DB_PATH = previousDbPath;
    }

    rmSync(dir, { recursive: true, force: true });
  }
}
