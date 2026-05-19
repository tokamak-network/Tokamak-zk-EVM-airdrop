import { randomUUID } from "node:crypto";

import { getDb } from "@/lib/db";
import type { ApplicationStatus } from "@/lib/status";

export type Application = {
  id: string;
  l2Address: string;
  qualifyingTxHash: string;
  status: ApplicationStatus;
  reason: string | null;
  payoutTxHash: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApplicationRow = {
  id: string;
  l2_address: string;
  qualifying_tx_hash: string;
  status: ApplicationStatus;
  reason: string | null;
  payout_tx_hash: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateApplicationInput = {
  l2Address: string;
  qualifyingTxHash: string;
};

export function createApplication(input: CreateApplicationInput): Application {
  const l2Address = normalizeInput(input.l2Address);
  const qualifyingTxHash = normalizeInput(input.qualifyingTxHash);
  assertSubmissionInput(l2Address, qualifyingTxHash);

  const db = getDb();
  const duplicate = findDuplicate(l2Address, qualifyingTxHash);
  const now = new Date().toISOString();
  const id = randomUUID();
  const status: ApplicationStatus = duplicate ? "Duplication" : "Pending";
  const reason = duplicate ? getDuplicateReason(duplicate, l2Address, qualifyingTxHash) : null;

  db.prepare(`
    INSERT INTO applications (
      id,
      l2_address,
      qualifying_tx_hash,
      status,
      reason,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, l2Address, qualifyingTxHash, status, reason, now, now);

  const application = getApplicationById(id);

  if (!application) {
    throw new Error("Application was not persisted.");
  }

  return application;
}

export function getApplicationById(id: string): Application | null {
  const row = getDb()
    .prepare("SELECT * FROM applications WHERE id = ?")
    .get(id) as ApplicationRow | undefined;

  return row ? mapApplication(row) : null;
}

export function findApplication(query: string): Application | null {
  const normalizedQuery = normalizeInput(query);

  if (!normalizedQuery) {
    return null;
  }

  const exactIdRow = getDb()
    .prepare("SELECT * FROM applications WHERE id = ?")
    .get(normalizedQuery) as ApplicationRow | undefined;

  if (exactIdRow) {
    return mapApplication(exactIdRow);
  }

  const row = getDb()
    .prepare(`
      SELECT * FROM applications
      WHERE l2_address = ?
        OR qualifying_tx_hash = ?
      ORDER BY
        CASE status
          WHEN 'Transferred' THEN 1
          WHEN 'Pending' THEN 2
          WHEN 'Failed' THEN 3
          WHEN 'Duplication' THEN 4
        END,
        created_at DESC
      LIMIT 1
    `)
    .get(normalizedQuery, normalizedQuery) as ApplicationRow | undefined;

  return row ? mapApplication(row) : null;
}

export function listApplications(limit = 100): Application[] {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const rows = getDb()
    .prepare("SELECT * FROM applications ORDER BY created_at DESC LIMIT ?")
    .all(safeLimit) as ApplicationRow[];

  return rows.map(mapApplication);
}

export function getPendingForVerification(limit = 25): Application[] {
  const rows = getDb()
    .prepare(`
      SELECT * FROM applications
      WHERE status = 'Pending'
        AND verified_at IS NULL
      ORDER BY created_at ASC
      LIMIT ?
    `)
    .all(limit) as ApplicationRow[];

  return rows.map(mapApplication);
}

export function getVerifiedPendingForPayout(limit = 25): Application[] {
  const rows = getDb()
    .prepare(`
      SELECT * FROM applications
      WHERE status = 'Pending'
        AND verified_at IS NOT NULL
      ORDER BY verified_at ASC
      LIMIT ?
    `)
    .all(limit) as ApplicationRow[];

  return rows.map(mapApplication);
}

export function markVerified(id: string): void {
  updateApplication(id, {
    verified_at: new Date().toISOString(),
    reason: null,
  });
}

export function markDuplication(id: string, reason: string): void {
  updateApplication(id, {
    status: "Duplication",
    reason,
  });
}

export function markFailed(id: string, reason: string): void {
  updateApplication(id, {
    status: "Failed",
    reason,
  });
}

export function markTransferred(id: string, payoutTxHash: string): void {
  updateApplication(id, {
    status: "Transferred",
    payout_tx_hash: payoutTxHash,
    reason: null,
  });
}

export function hasTransferredDuplicate(application: Application): boolean {
  const row = getDb()
    .prepare(`
      SELECT id FROM applications
      WHERE id != ?
        AND status = 'Transferred'
        AND (l2_address = ? OR qualifying_tx_hash = ?)
      LIMIT 1
    `)
    .get(application.id, application.l2Address, application.qualifyingTxHash);

  return Boolean(row);
}

export function countTransferredApplications(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'Transferred'")
    .get() as { count: number };

  return row.count;
}

function updateApplication(
  id: string,
  values: Partial<{
    status: ApplicationStatus;
    reason: string | null;
    payout_tx_hash: string;
    verified_at: string;
  }>,
): void {
  const entries = Object.entries(values).filter(
    (entry): entry is [string, string | null] => entry[1] !== undefined,
  );

  if (entries.length === 0) {
    return;
  }

  const sqlAssignments = entries.map(([key]) => `${key} = ?`).join(", ");
  const sqlValues = entries.map(([, value]) => value);

  getDb()
    .prepare(`
      UPDATE applications
      SET ${sqlAssignments},
          updated_at = ?
      WHERE id = ?
    `)
    .run(...sqlValues, new Date().toISOString(), id);
}

function findDuplicate(
  l2Address: string,
  qualifyingTxHash: string,
): Application | null {
  const row = getDb()
    .prepare(`
      SELECT * FROM applications
      WHERE l2_address = ?
        OR qualifying_tx_hash = ?
      ORDER BY created_at ASC
      LIMIT 1
    `)
    .get(l2Address, qualifyingTxHash) as ApplicationRow | undefined;

  return row ? mapApplication(row) : null;
}

function getDuplicateReason(
  duplicate: Application,
  l2Address: string,
  qualifyingTxHash: string,
): string {
  if (
    duplicate.l2Address === l2Address &&
    duplicate.qualifyingTxHash === qualifyingTxHash
  ) {
    return "Duplicate L2 address and transaction hash.";
  }

  if (duplicate.l2Address === l2Address) {
    return "Duplicate L2 address.";
  }

  if (duplicate.qualifyingTxHash === qualifyingTxHash) {
    return "Duplicate transaction hash.";
  }

  return "Duplicate application.";
}

function assertSubmissionInput(l2Address: string, qualifyingTxHash: string): void {
  if (!isSafeSubmittedValue(l2Address)) {
    throw new Error("L2 address is required and must not contain whitespace.");
  }

  if (!isSafeSubmittedValue(qualifyingTxHash)) {
    throw new Error(
      "Qualifying transaction hash is required and must not contain whitespace.",
    );
  }
}

function isSafeSubmittedValue(value: string): boolean {
  return value.length > 0 && value.length <= 180 && !/\s/.test(value);
}

function normalizeInput(value: string): string {
  return value.trim();
}

function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    l2Address: row.l2_address,
    qualifyingTxHash: row.qualifying_tx_hash,
    status: row.status,
    reason: row.reason,
    payoutTxHash: row.payout_tx_hash,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
