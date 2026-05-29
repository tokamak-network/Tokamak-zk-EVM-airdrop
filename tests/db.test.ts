import assert from "node:assert/strict";
import test from "node:test";

import { closeDb, shouldAutoMigrate } from "@/lib/db";

test("runtime migrations run automatically for SQLite by default", () => {
  withMigrationEnv(undefined, undefined, () => {
    assert.equal(shouldAutoMigrate(), true);
  });
});

test("runtime migrations are disabled for Postgres by default", () => {
  withMigrationEnv("postgres://user:pass@example.com/db", undefined, () => {
    assert.equal(shouldAutoMigrate(), false);
  });
});

test("AIRDROP_AUTO_MIGRATE explicitly controls runtime migrations", () => {
  withMigrationEnv("postgres://user:pass@example.com/db", "true", () => {
    assert.equal(shouldAutoMigrate(), true);
  });

  withMigrationEnv(undefined, "false", () => {
    assert.equal(shouldAutoMigrate(), false);
  });
});

function withMigrationEnv(
  databaseUrl: string | undefined,
  autoMigrate: string | undefined,
  run: () => void,
): void {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousAutoMigrate = process.env.AIRDROP_AUTO_MIGRATE;

  restoreEnv("DATABASE_URL", databaseUrl);
  restoreEnv("AIRDROP_AUTO_MIGRATE", autoMigrate);

  try {
    run();
  } finally {
    closeDb();
    restoreEnv("DATABASE_URL", previousDatabaseUrl);
    restoreEnv("AIRDROP_AUTO_MIGRATE", previousAutoMigrate);
  }
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  Reflect.set(process.env, name, value);
}
