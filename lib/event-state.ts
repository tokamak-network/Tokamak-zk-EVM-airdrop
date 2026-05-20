import { dbGet, dbRun } from "@/lib/db";

export const EVENT_STATE_ID = "tonnel-airdrop";

export type EventState = {
  id: string;
  remainingBudgetTon: number | null;
  rewardWalletUnusedNoteCount: number;
  rewardWalletUnusedNoteBalanceTon: number | null;
  transferredCount: number;
  expectedSpentTon: number;
  budgetDiscrepancyTon: number | null;
  lastBudgetSyncAt: string | null;
  lastWorkerRunAt: string | null;
  lastWorkerError: string | null;
  updatedAt: string;
};

type EventStateRow = {
  id: string;
  remaining_budget_ton: number | null;
  reward_wallet_unused_note_count: number | string;
  reward_wallet_unused_note_balance_ton: number | null;
  transferred_count: number | string;
  expected_spent_ton: number | string;
  budget_discrepancy_ton: number | null;
  last_budget_sync_at: string | null;
  last_worker_run_at: string | null;
  last_worker_error: string | null;
  updated_at: string;
};

export type BudgetSyncInput = {
  remainingBudgetTon: number;
  rewardWalletUnusedNoteCount: number;
  transferredCount: number;
  expectedSpentTon: number;
  budgetDiscrepancyTon: number | null;
};

export async function getEventState(): Promise<EventState | null> {
  const row = await dbGet<EventStateRow>(
    "SELECT * FROM event_state WHERE id = ?",
    [EVENT_STATE_ID],
  );

  return row ? mapEventState(row) : null;
}

export async function upsertBudgetSync(input: BudgetSyncInput): Promise<void> {
  const now = new Date().toISOString();

  await dbRun(
    `
      INSERT INTO event_state (
        id,
        remaining_budget_ton,
        reward_wallet_unused_note_count,
        reward_wallet_unused_note_balance_ton,
        transferred_count,
        expected_spent_ton,
        budget_discrepancy_ton,
        last_budget_sync_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        remaining_budget_ton = excluded.remaining_budget_ton,
        reward_wallet_unused_note_count = excluded.reward_wallet_unused_note_count,
        reward_wallet_unused_note_balance_ton = excluded.reward_wallet_unused_note_balance_ton,
        transferred_count = excluded.transferred_count,
        expected_spent_ton = excluded.expected_spent_ton,
        budget_discrepancy_ton = excluded.budget_discrepancy_ton,
        last_budget_sync_at = excluded.last_budget_sync_at,
        updated_at = excluded.updated_at
    `,
    [
      EVENT_STATE_ID,
      input.remainingBudgetTon,
      input.rewardWalletUnusedNoteCount,
      input.remainingBudgetTon,
      input.transferredCount,
      input.expectedSpentTon,
      input.budgetDiscrepancyTon,
      now,
      now,
    ],
  );
}

export async function markWorkerRun(error: string | null): Promise<void> {
  const now = new Date().toISOString();

  await dbRun(
    `
      INSERT INTO event_state (
        id,
        last_worker_run_at,
        last_worker_error,
        updated_at
      )
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        last_worker_run_at = excluded.last_worker_run_at,
        last_worker_error = excluded.last_worker_error,
        updated_at = excluded.updated_at
    `,
    [EVENT_STATE_ID, now, error, now],
  );
}

function mapEventState(row: EventStateRow): EventState {
  return {
    id: row.id,
    remainingBudgetTon: nullableNumber(row.remaining_budget_ton),
    rewardWalletUnusedNoteCount: Number(row.reward_wallet_unused_note_count),
    rewardWalletUnusedNoteBalanceTon: nullableNumber(
      row.reward_wallet_unused_note_balance_ton,
    ),
    transferredCount: Number(row.transferred_count),
    expectedSpentTon: Number(row.expected_spent_ton),
    budgetDiscrepancyTon: nullableNumber(row.budget_discrepancy_ton),
    lastBudgetSyncAt: row.last_budget_sync_at,
    lastWorkerRunAt: row.last_worker_run_at,
    lastWorkerError: row.last_worker_error,
    updatedAt: row.updated_at,
  };
}

function nullableNumber(value: number | string | null): number | null {
  return value === null ? null : Number(value);
}
