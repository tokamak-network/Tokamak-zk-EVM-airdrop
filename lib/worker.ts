import {
  countTransferredApplications,
  getPendingForVerification,
  getVerifiedPendingForPayout,
  hasTransferredDuplicate,
  markDuplication,
  markFailed,
  markTransferred,
  markVerified,
} from "@/lib/applications";
import { getConfig } from "@/lib/config";
import { markWorkerRun, upsertBudgetSync } from "@/lib/event-state";
import {
  getRewardWalletL2Address,
  getWalletNotes,
  preparePrivateStateCli,
  resolveRewardWalletName,
  transferNotes,
} from "@/lib/private-state-cli";
import {
  parseUnusedRewardNotes,
  selectRewardNotes,
  sumRewardNotes,
} from "@/lib/reward-notes";
import { verifySubmittedTransaction } from "@/lib/rpc-verifier";

export type WorkerSummary = {
  verified: number;
  transferred: number;
  duplicated: number;
  failed: number;
  skippedPayouts: number;
  remainingBudgetTon: number | null;
};

export async function runAirdropWorker(): Promise<WorkerSummary> {
  const summary: WorkerSummary = {
    verified: 0,
    transferred: 0,
    duplicated: 0,
    failed: 0,
    skippedPayouts: 0,
    remainingBudgetTon: null,
  };

  try {
    await runWorkerSteps(summary);
    markWorkerRun(null);
    return summary;
  } catch (error) {
    markWorkerRun(getErrorMessage(error));
    throw error;
  }
}

async function runWorkerSteps(summary: WorkerSummary): Promise<void> {
  const config = getConfig();

  await preparePrivateStateCli(config);
  await verifyPendingApplications(summary);

  const rewardWallet = await resolveRewardWalletName(config);
  await syncBudget(summary, rewardWallet);
  await payoutVerifiedApplications(summary, rewardWallet);
  await syncBudget(summary, rewardWallet);
}

async function verifyPendingApplications(summary: WorkerSummary): Promise<void> {
  const config = getConfig();

  for (const application of getPendingForVerification()) {
    try {
      const result = await verifySubmittedTransaction(
        config,
        application.qualifyingTxHash,
      );

      if (result.valid) {
        markVerified(
          application.id,
          result.resolvedL1Address,
          result.resolvedL2Address,
        );
        summary.verified += 1;
      } else {
        markFailed(application.id, result.reason);
        summary.failed += 1;
      }
    } catch (error) {
      markFailed(application.id, getErrorMessage(error));
      summary.failed += 1;
    }
  }
}

async function payoutVerifiedApplications(
  summary: WorkerSummary,
  rewardWallet: string,
): Promise<void> {
  const config = getConfig();

  if (config.payoutsPaused) {
    summary.skippedPayouts += getVerifiedPendingForPayout().length;
    return;
  }

  for (const application of getVerifiedPendingForPayout()) {
    if (hasTransferredDuplicate(application)) {
      markDuplication(
        application.id,
        "A transferred application already exists for this resolved L2 address or transaction hash.",
      );
      summary.duplicated += 1;
      continue;
    }

    if (!application.resolvedL2Address) {
      markFailed(application.id, "Verified application is missing a resolved L2 address.");
      summary.failed += 1;
      continue;
    }

    try {
      const notesOutput = await getWalletNotes(config, rewardWallet);
      const notes = parseUnusedRewardNotes(notesOutput);

      if (sumRewardNotes(notes) < config.rewardTon) {
        markFailed(application.id, "Reward wallet has less than 25 TON in unused notes.");
        summary.failed += 1;
        continue;
      }

      const rewardWalletL2Address = needsChangeAddress(notes, config.rewardTon)
        ? await getRewardWalletL2Address(config, rewardWallet)
        : application.resolvedL2Address;
      const selection = selectRewardNotes(
        notes,
        config.rewardTon,
        application.resolvedL2Address,
        rewardWalletL2Address,
      );
      const payoutTxHash = await transferNotes(
        config,
        rewardWallet,
        selection.noteIds,
        selection.recipients,
        selection.amounts,
      );

      markTransferred(application.id, payoutTxHash);
      summary.transferred += 1;
      await syncBudget(summary, rewardWallet);
    } catch (error) {
      markFailed(application.id, getErrorMessage(error));
      summary.failed += 1;
    }
  }
}

async function syncBudget(
  summary: WorkerSummary,
  rewardWallet: string,
): Promise<void> {
  const config = getConfig();
  const notesOutput = await getWalletNotes(config, rewardWallet);
  const notes = parseUnusedRewardNotes(notesOutput);
  const remainingBudgetTon = sumRewardNotes(notes);
  const transferredCount = countTransferredApplications();
  const expectedSpentTon = transferredCount * config.rewardTon;

  upsertBudgetSync({
    remainingBudgetTon,
    rewardWalletUnusedNoteCount: notes.length,
    transferredCount,
    expectedSpentTon,
    budgetDiscrepancyTon: null,
  });

  summary.remainingBudgetTon = remainingBudgetTon;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error.";
}

function needsChangeAddress(
  notes: Array<{ valueTon: number }>,
  rewardTon: number,
): boolean {
  const hasExact = notes.some((note) => note.valueTon === rewardTon);

  if (hasExact) {
    return false;
  }

  return notes.some((note) => note.valueTon > rewardTon);
}
