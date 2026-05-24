import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { neon } from "@neondatabase/serverless";

import { getConfig } from "@/lib/config";

type SqlValue = string | number | null;
type SqlClient = ReturnType<typeof neon>;

let sqliteDatabase: DatabaseSync | null = null;
let sqlClient: SqlClient | null = null;
let migrated = false;

export function usingPostgres(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function dbGet<T extends Record<string, unknown>>(
  sql: string,
  params: SqlValue[] = [],
): Promise<T | null> {
  await ensureMigrated();

  if (usingPostgres()) {
    const rows = await runPostgres<T>(sql, params);

    return rows[0] ?? null;
  }

  return getSqliteDb().prepare(sql).get(...params) as T | null;
}

export async function dbAll<T extends Record<string, unknown>>(
  sql: string,
  params: SqlValue[] = [],
): Promise<T[]> {
  await ensureMigrated();

  if (usingPostgres()) {
    return runPostgres<T>(sql, params);
  }

  return getSqliteDb().prepare(sql).all(...params) as T[];
}

export async function dbRun(
  sql: string,
  params: SqlValue[] = [],
): Promise<void> {
  await ensureMigrated();

  if (usingPostgres()) {
    await runPostgres(sql, params);
    return;
  }

  getSqliteDb().prepare(sql).run(...params);
}

export async function migrate(): Promise<void> {
  if (usingPostgres()) {
    await migratePostgres();
  } else {
    migrateSqlite(getSqliteDb());
  }

  migrated = true;
}

export function closeDb(): void {
  if (sqliteDatabase) {
    sqliteDatabase.close();
    sqliteDatabase = null;
  }

  sqlClient = null;
  migrated = false;
}

async function ensureMigrated(): Promise<void> {
  if (migrated) {
    return;
  }

  await migrate();
}

function getSqliteDb(): DatabaseSync {
  if (process.env.VERCEL === "1") {
    throw new Error("DATABASE_URL is required for Vercel deployments.");
  }

  if (!sqliteDatabase) {
    const { dbPath } = getConfig();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    sqliteDatabase = new DatabaseSync(dbPath);
    sqliteDatabase.exec("PRAGMA journal_mode = WAL;");
    sqliteDatabase.exec("PRAGMA foreign_keys = ON;");
  }

  return sqliteDatabase;
}

function getSqlClient(): SqlClient {
  if (!sqlClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for Postgres database access.");
    }

    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

async function runPostgres<T extends Record<string, unknown>>(
  sql: string,
  params: SqlValue[] = [],
): Promise<T[]> {
  const postgresSql = toPostgresSql(sql);

  return (await getSqlClient().query(postgresSql, params)) as T[];
}

function toPostgresSql(sql: string): string {
  let index = 0;

  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

function migrateSqlite(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      l2_address TEXT,
      qualifying_tx_hash TEXT NOT NULL,
      resolved_l1_address TEXT,
      resolved_l2_address TEXT,
      status TEXT NOT NULL CHECK (status IN ('Pending', 'Transferred', 'Duplication', 'Invalid tx', 'Failed')),
      reason TEXT,
      payout_tx_hash TEXT,
      verified_at TEXT,
      transferred_at TEXT,
      submitter_ip_hash TEXT,
      submitter_user_agent_hash TEXT,
      submitter_country TEXT,
      submitter_region TEXT,
      submitter_city TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_applications_l2_address
      ON applications (l2_address);

    CREATE INDEX IF NOT EXISTS idx_applications_tx_hash
      ON applications (qualifying_tx_hash);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique_active_tx_hash
      ON applications (qualifying_tx_hash)
      WHERE status != 'Duplication';

    CREATE INDEX IF NOT EXISTS idx_applications_status
      ON applications (status);
  `);

  addColumnIfMissing(db, "applications", "resolved_l1_address", "TEXT");
  addColumnIfMissing(db, "applications", "resolved_l2_address", "TEXT");
  addColumnIfMissing(db, "applications", "transferred_at", "TEXT");
  addColumnIfMissing(db, "applications", "submitter_ip_hash", "TEXT");
  addColumnIfMissing(db, "applications", "submitter_user_agent_hash", "TEXT");
  addColumnIfMissing(db, "applications", "submitter_country", "TEXT");
  addColumnIfMissing(db, "applications", "submitter_region", "TEXT");
  addColumnIfMissing(db, "applications", "submitter_city", "TEXT");

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_applications_resolved_l1_address
      ON applications (resolved_l1_address);

    CREATE INDEX IF NOT EXISTS idx_applications_resolved_l2_address
      ON applications (resolved_l2_address);

    CREATE INDEX IF NOT EXISTS idx_applications_submitter_ip_hash
      ON applications (submitter_ip_hash);

    CREATE INDEX IF NOT EXISTS idx_applications_submitter_ip_ua_hash
      ON applications (submitter_ip_hash, submitter_user_agent_hash);

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

async function migratePostgres(): Promise<void> {
  for (const statement of postgresMigrations) {
    await runPostgres(statement);
  }
}

const postgresMigrations = [
  `
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      l2_address TEXT,
      qualifying_tx_hash TEXT NOT NULL,
      resolved_l1_address TEXT,
      resolved_l2_address TEXT,
      status TEXT NOT NULL CHECK (status IN ('Pending', 'Transferred', 'Duplication', 'Invalid tx', 'Failed')),
      reason TEXT,
      payout_tx_hash TEXT,
      verified_at TEXT,
      transferred_at TEXT,
      submitter_ip_hash TEXT,
      submitter_user_agent_hash TEXT,
      submitter_country TEXT,
      submitter_region TEXT,
      submitter_city TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `,
  "ALTER TABLE applications ADD COLUMN IF NOT EXISTS resolved_l1_address TEXT",
  "ALTER TABLE applications ADD COLUMN IF NOT EXISTS resolved_l2_address TEXT",
  "ALTER TABLE applications ADD COLUMN IF NOT EXISTS transferred_at TEXT",
  "ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitter_ip_hash TEXT",
  "ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitter_user_agent_hash TEXT",
  "ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitter_country TEXT",
  "ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitter_region TEXT",
  "ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitter_city TEXT",
  `
    DO $$
    DECLARE
      existing_status_check TEXT;
    BEGIN
      SELECT pg_get_constraintdef(oid)
        INTO existing_status_check
        FROM pg_constraint
       WHERE conrelid = 'applications'::regclass
         AND conname = 'applications_status_check';

      IF existing_status_check IS NULL OR existing_status_check NOT LIKE '%Invalid tx%' THEN
        IF existing_status_check IS NOT NULL THEN
          ALTER TABLE applications DROP CONSTRAINT applications_status_check;
        END IF;

        ALTER TABLE applications ADD CONSTRAINT applications_status_check
          CHECK (status IN ('Pending', 'Transferred', 'Duplication', 'Invalid tx', 'Failed'));
      END IF;
    EXCEPTION
      WHEN duplicate_object THEN
        NULL;
    END
    $$
  `,
  "CREATE INDEX IF NOT EXISTS idx_applications_l2_address ON applications (l2_address)",
  "CREATE INDEX IF NOT EXISTS idx_applications_tx_hash ON applications (qualifying_tx_hash)",
  `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique_active_tx_hash
      ON applications (qualifying_tx_hash)
      WHERE status != 'Duplication'
  `,
  "CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status)",
  "CREATE INDEX IF NOT EXISTS idx_applications_resolved_l1_address ON applications (resolved_l1_address)",
  "CREATE INDEX IF NOT EXISTS idx_applications_resolved_l2_address ON applications (resolved_l2_address)",
  "CREATE INDEX IF NOT EXISTS idx_applications_submitter_ip_hash ON applications (submitter_ip_hash)",
  "CREATE INDEX IF NOT EXISTS idx_applications_submitter_ip_ua_hash ON applications (submitter_ip_hash, submitter_user_agent_hash)",
  `
    CREATE TABLE IF NOT EXISTS event_state (
      id TEXT PRIMARY KEY,
      remaining_budget_ton DOUBLE PRECISION,
      reward_wallet_unused_note_count INTEGER NOT NULL DEFAULT 0,
      reward_wallet_unused_note_balance_ton DOUBLE PRECISION,
      transferred_count INTEGER NOT NULL DEFAULT 0,
      expected_spent_ton DOUBLE PRECISION NOT NULL DEFAULT 0,
      budget_discrepancy_ton DOUBLE PRECISION,
      last_budget_sync_at TEXT,
      last_worker_run_at TEXT,
      last_worker_error TEXT,
      updated_at TEXT NOT NULL
    )
  `,
];

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
