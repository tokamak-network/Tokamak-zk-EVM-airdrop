import { randomUUID } from "node:crypto";

import { dbAll, dbGet, dbRun } from "@/lib/db";
import {
  FAILURE_REASONS,
  type ApplicationStatus,
  type FailureReason,
  isFailureReason,
} from "@/lib/status";
import type { SubmissionMetadata } from "@/lib/submission-metadata";

export type Application = {
  id: string;
  qualifyingTxHash: string;
  resolvedL1Address: string | null;
  resolvedL2Address: string | null;
  status: ApplicationStatus;
  reason: string | null;
  failureReasons: FailureReason[];
  payoutTxHash: string | null;
  verifiedAt: string | null;
  transferredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApplicationRow = {
  id: string;
  qualifying_tx_hash: string;
  l2_address: string | null;
  resolved_l1_address: string | null;
  resolved_l2_address: string | null;
  status: ApplicationStatus;
  reason: string | null;
  failure_reasons_json: string | null;
  payout_tx_hash: string | null;
  verified_at: string | null;
  transferred_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateApplicationInput = {
  qualifyingTxHash: string;
  submitterMetadata?: SubmissionMetadata;
};

export type CreateApplicationResult = {
  application: Application;
  created: boolean;
};

export async function createApplication(
  input: CreateApplicationInput,
): Promise<CreateApplicationResult> {
  const qualifyingTxHash = normalizeTxHash(input.qualifyingTxHash);
  assertSubmissionInput(qualifyingTxHash);

  const duplicate = await findDuplicateTransaction(qualifyingTxHash);

  if (duplicate) {
    return {
      application: duplicate,
      created: false,
    };
  }

  const now = new Date().toISOString();
  const id = randomUUID();
  const metadata = input.submitterMetadata;

  try {
    await dbRun(
      `
        INSERT INTO applications (
          id,
          l2_address,
          qualifying_tx_hash,
          status,
          reason,
          failure_reasons_json,
          submitter_ip_hash,
          submitter_ip_hash_version,
          submitter_user_agent_hash,
          submitter_country,
          submitter_region,
          submitter_city,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        "",
        qualifyingTxHash,
        "Pending",
        null,
        null,
        metadata?.submitterIpHash ?? null,
        metadata?.submitterIpHashVersion ?? null,
        metadata?.submitterUserAgentHash ?? null,
        metadata?.submitterCountry ?? null,
        metadata?.submitterRegion ?? null,
        metadata?.submitterCity ?? null,
        now,
        now,
      ],
    );
  } catch (error) {
    const existing = await findDuplicateTransaction(qualifyingTxHash);

    if (existing) {
      return {
        application: existing,
        created: false,
      };
    }

    throw error;
  }

  const application = await getApplicationById(id);

  if (!application) {
    throw new Error("Application was not persisted.");
  }

  return {
    application,
    created: true,
  };
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const row = await dbGet<ApplicationRow>(
    "SELECT * FROM applications WHERE id = ?",
    [id],
  );

  return row ? mapApplication(row) : null;
}

export async function findApplication(query: string): Promise<Application | null> {
  const normalizedQuery = normalizeInput(query);

  if (!normalizedQuery) {
    return null;
  }

  const exactIdRow = await dbGet<ApplicationRow>(
    "SELECT * FROM applications WHERE id = ?",
    [normalizedQuery],
  );

  if (exactIdRow) {
    return mapApplication(exactIdRow);
  }

  const row = await dbGet<ApplicationRow>(
    `
      SELECT * FROM applications
      WHERE qualifying_tx_hash = ?
        OR resolved_l1_address = ?
        OR resolved_l2_address = ?
        OR l2_address = ?
      ORDER BY
        CASE status
          WHEN 'Transferred' THEN 1
          WHEN 'Pending' THEN 2
          WHEN 'Failed' THEN 3
        END,
        created_at DESC
      LIMIT 1
    `,
    normalizedQuery.match(/^0x[a-fA-F0-9]{64}$/)
      ? [
          normalizeTxHash(normalizedQuery),
          normalizedQuery,
          normalizedQuery,
          normalizedQuery,
        ]
      : [
          normalizedQuery,
          normalizedQuery,
          normalizedQuery,
          normalizedQuery,
        ],
  );

  return row ? mapApplication(row) : null;
}

export async function listApplications(
  limit = 100,
  offset = 0,
): Promise<Application[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const safeOffset = Math.max(offset, 0);
  const rows = await dbAll<ApplicationRow>(
    "SELECT * FROM applications ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [safeLimit, safeOffset],
  );

  return rows.map(mapApplication);
}

export async function countApplications(): Promise<number> {
  const row = await dbGet<{ count: number | string }>(
    "SELECT COUNT(*) as count FROM applications",
  );

  return Number(row?.count ?? 0);
}

export async function getPendingForVerification(
  limit = 25,
): Promise<Application[]> {
  const rows = await dbAll<ApplicationRow>(
    `
      SELECT * FROM applications
      WHERE status = 'Pending'
        AND verified_at IS NULL
      ORDER BY created_at ASC
      LIMIT ?
    `,
    [limit],
  );

  return rows.map(mapApplication);
}

export async function getNextPendingApplication(): Promise<Application | null> {
  const row = await dbGet<ApplicationRow>(
    `
      SELECT * FROM applications
      WHERE status = 'Pending'
      ORDER BY created_at ASC
      LIMIT 1
    `,
  );

  return row ? mapApplication(row) : null;
}

export async function markVerified(
  id: string,
  resolvedL1Address: string,
  resolvedL2Address: string,
): Promise<void> {
  await updateApplication(id, {
    resolved_l1_address: normalizeInput(resolvedL1Address),
    resolved_l2_address: normalizeInput(resolvedL2Address),
    verified_at: new Date().toISOString(),
    reason: null,
  });
}

export async function markFailed(
  id: string,
  failureReasons: FailureReason[],
  reason: string | null = null,
): Promise<void> {
  await updateApplication(id, {
    status: "Failed",
    reason,
    failure_reasons_json: stringifyFailureReasons(failureReasons),
  });
}

export async function markTransferred(
  id: string,
  payoutTxHash: string,
): Promise<void> {
  await updateApplication(id, {
    status: "Transferred",
    payout_tx_hash: payoutTxHash,
    transferred_at: new Date().toISOString(),
    reason: null,
    failure_reasons_json: null,
  });
}

export async function getTransferredDuplicateReasons(
  application: Application,
): Promise<FailureReason[]> {
  const reasons: FailureReason[] = [];
  const txRow = await dbGet<{ id: string }>(
    `
      SELECT id FROM applications
      WHERE id != ?
        AND status = 'Transferred'
        AND qualifying_tx_hash = ?
      LIMIT 1
    `,
    [application.id, application.qualifyingTxHash],
  );

  if (txRow) {
    reasons.push("duplicate_transaction");
  }

  if (!application.resolvedL2Address) {
    return reasons;
  }

  const l2Row = await dbGet<{ id: string }>(
    `
      SELECT id FROM applications
      WHERE id != ?
        AND status = 'Transferred'
        AND resolved_l2_address = ?
      LIMIT 1
    `,
    [application.id, application.resolvedL2Address],
  );

  if (l2Row) {
    reasons.push("duplicate_channel_account");
  }

  return reasons;
}

export async function hasTransferredL2Address(
  resolvedL2Address: string,
): Promise<boolean> {
  const row = await dbGet<{ id: string }>(
    `
      SELECT id FROM applications
      WHERE status = 'Transferred'
        AND resolved_l2_address = ?
      LIMIT 1
    `,
    [normalizeInput(resolvedL2Address)],
  );

  return Boolean(row);
}

export async function hasSubmittedTransaction(
  qualifyingTxHash: string,
): Promise<boolean> {
  if (!isSafeSubmittedValue(normalizeInput(qualifyingTxHash))) {
    return false;
  }

  return Boolean(await findDuplicateTransaction(normalizeTxHash(qualifyingTxHash)));
}

export async function countTransferredApplications(): Promise<number> {
  const row = await dbGet<{ count: number | string }>(
    "SELECT COUNT(*) as count FROM applications WHERE status = 'Transferred'",
  );

  return Number(row?.count ?? 0);
}

async function updateApplication(
  id: string,
  values: Partial<{
    status: ApplicationStatus;
    reason: string | null;
    failure_reasons_json: string | null;
    payout_tx_hash: string;
    verified_at: string;
    transferred_at: string;
    resolved_l1_address: string;
    resolved_l2_address: string;
  }>,
): Promise<void> {
  const entries = Object.entries(values).filter(
    (entry): entry is [string, string | null] => entry[1] !== undefined,
  );

  if (entries.length === 0) {
    return;
  }

  const sqlAssignments = entries.map(([key]) => `${key} = ?`).join(", ");
  const sqlValues = entries.map(([, value]) => value);

  await dbRun(
    `
      UPDATE applications
      SET ${sqlAssignments},
          updated_at = ?
      WHERE id = ?
    `,
    [...sqlValues, new Date().toISOString(), id],
  );
}

async function findDuplicateTransaction(
  qualifyingTxHash: string,
): Promise<Application | null> {
  const row = await dbGet<ApplicationRow>(
    `
      SELECT * FROM applications
      WHERE qualifying_tx_hash = ?
      ORDER BY created_at ASC
      LIMIT 1
    `,
    [qualifyingTxHash],
  );

  return row ? mapApplication(row) : null;
}

function assertSubmissionInput(qualifyingTxHash: string): void {
  if (!isSafeSubmittedValue(qualifyingTxHash)) {
    throw new Error(
      "Qualifying transaction hash must be a 0x-prefixed 32-byte Ethereum transaction hash.",
    );
  }
}

function isSafeSubmittedValue(value: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

function normalizeInput(value: string): string {
  return value.trim();
}

function normalizeTxHash(value: string): string {
  return normalizeInput(value).toLowerCase();
}

function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    qualifyingTxHash: row.qualifying_tx_hash,
    resolvedL1Address: row.resolved_l1_address,
    resolvedL2Address: row.resolved_l2_address,
    status: row.status,
    reason: row.reason,
    failureReasons: parseFailureReasons(row.failure_reasons_json),
    payoutTxHash: row.payout_tx_hash,
    verifiedAt: row.verified_at,
    transferredAt: row.transferred_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function stringifyFailureReasons(reasons: FailureReason[]): string {
  const uniqueReasons = FAILURE_REASONS.filter((reason) =>
    reasons.includes(reason),
  );

  if (uniqueReasons.length === 0) {
    return JSON.stringify(["internal_payout_error"]);
  }

  return JSON.stringify(uniqueReasons);
}

function parseFailureReasons(value: string | null): FailureReason[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (reason): reason is FailureReason =>
        typeof reason === "string" && isFailureReason(reason),
    );
  } catch {
    return [];
  }
}
