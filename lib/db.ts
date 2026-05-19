import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { getConfig } from "@/lib/config";

let database: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!database) {
    const { dbPath } = getConfig();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    database = new DatabaseSync(dbPath);
    database.exec("PRAGMA journal_mode = WAL;");
    database.exec("PRAGMA foreign_keys = ON;");
    migrate(database);
  }

  return database;
}

export function migrate(db = getDb()): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      l2_address TEXT,
      qualifying_tx_hash TEXT NOT NULL,
      resolved_l1_address TEXT,
      resolved_l2_address TEXT,
      status TEXT NOT NULL CHECK (status IN ('Pending', 'Transferred', 'Duplication', 'Failed')),
      reason TEXT,
      payout_tx_hash TEXT,
      verified_at TEXT,
      transferred_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_applications_l2_address
      ON applications (l2_address);

    CREATE INDEX IF NOT EXISTS idx_applications_tx_hash
      ON applications (qualifying_tx_hash);

    CREATE INDEX IF NOT EXISTS idx_applications_status
      ON applications (status);
  `);

  addColumnIfMissing(db, "applications", "resolved_l1_address", "TEXT");
  addColumnIfMissing(db, "applications", "resolved_l2_address", "TEXT");
  addColumnIfMissing(db, "applications", "transferred_at", "TEXT");

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_applications_resolved_l1_address
      ON applications (resolved_l1_address);

    CREATE INDEX IF NOT EXISTS idx_applications_resolved_l2_address
      ON applications (resolved_l2_address);

    CREATE TABLE IF NOT EXISTS event_state (
      id TEXT PRIMARY KEY,
      remaining_budget_ton REAL,
      reward_wallet_unused_note_count INTEGER NOT NULL DEFAULT 0,
      reward_wallet_unused_note_balance_ton REAL,
      transferred_count INTEGER NOT NULL DEFAULT 0,
      expected_spent_ton REAL NOT NULL DEFAULT 0,
      budget_discrepancy_ton REAL,
      last_budget_sync_at TEXT,
      last_worker_run_at TEXT,
      last_worker_error TEXT,
      updated_at TEXT NOT NULL
    );
  `);
}

function addColumnIfMissing(
  db: DatabaseSync,
  tableName: string,
  columnName: string,
  columnDefinition: string,
): void {
  const columns = db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all() as Array<{ name: string }>;

  if (columns.some((column) => column.name === columnName)) {
    return;
  }

  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`);
}
