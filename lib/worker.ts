import {
  countTransferredApplications,
  getPendingForVerification,
  getVerifiedPendingForPayout,
  hasTransferredDuplicate,
  markDuplication,
  markFailed,
  markInvalidTx,
  markTransferred,
  markVerified,
} from "@/lib/applications";
import { type AppConfig, getConfig } from "@/lib/config";
import { markWorkerRun, upsertBudgetSync } from "@/lib/event-state";
import {
  getRewardWalletL2Address,
  getWalletNotes,
  preparePrivateStateCli,
  recoverRewardWalletWorkspace,
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
  invalidTx: number;
  failed: number;
  skippedPayouts: number;
  remainingBudgetTon: number | null;
};

export type WorkerDependencies = {
  getConfig: () => AppConfig;
  preparePrivateStateCli: (config: AppConfig) => Promise<void>;
  verifySubmittedTransaction: typeof verifySubmittedTransaction;
  resolveRewardWalletName: (config: AppConfig) => Promise<string>;
  getWalletNotes: (config: AppConfig, wallet: string) => Promise<unknown>;
  getRewardWalletL2Address: (
    config: AppConfig,
    wallet: string,
  ) => Promise<string>;
  recoverRewardWalletWorkspace: (config: AppConfig) => Promise<void>;
  transferNotes: (
    config: AppConfig,
    wallet: string,
    noteIds: string[],
    recipients: string[],
    amounts: string[],
  ) => Promise<string>;
};

const defaultDependencies: WorkerDependencies = {
  getConfig,
  preparePrivateStateCli,
  verifySubmittedTransaction,
  resolveRewardWalletName,
  getWalletNotes,
  getRewardWalletL2Address,
  recoverRewardWalletWorkspace,
  transferNotes,
};
const maxStaleWorkspaceRetries = 5;

export async function runAirdropWorker(
  dependencies: WorkerDependencies = defaultDependencies,
): Promise<WorkerSummary> {
  const summary: WorkerSummary = {
    verified: 0,
    transferred: 0,
    duplicated: 0,
    invalidTx: 0,
    failed: 0,
    skippedPayouts: 0,
    remainingBudgetTon: null,
  };

  try {
    await runWorkerSteps(summary, dependencies);
    await markWorkerRun(null);
    return summary;
  } catch (error) {
    await markWorkerRun(getErrorMessage(error));
    throw error;
  }
}

async function runWorkerSteps(
  summary: WorkerSummary,
  dependencies: WorkerDependencies,
): Promise<void> {
  const config = dependencies.getConfig();

  await dependencies.preparePrivateStateCli(config);
  await dependencies.recoverRewardWalletWorkspace(config);
  await verifyPendingApplications(summary, dependencies);

  const rewardWallet = await dependencies.resolveRewardWalletName(config);
  await syncBudget(summary, rewardWallet, dependencies);
  await payoutVerifiedApplications(summary, rewardWallet, dependencies);
  await syncBudget(summary, rewardWallet, dependencies);
}

async function verifyPendingApplications(
  summary: WorkerSummary,
  dependencies: WorkerDependencies,
): Promise<void> {
  const config = dependencies.getConfig();

  for (const application of await getPendingForVerification()) {
    try {
      const result = await dependencies.verifySubmittedTransaction(
        config,
        application.qualifyingTxHash,
      );

      if (result.valid) {
        await markVerified(
          application.id,
          result.resolvedL1Address,
          result.resolvedL2Address,
        );
        summary.verified += 1;
      } else {
        await markInvalidTx(application.id, result.reason);
        summary.invalidTx += 1;
      }
    } catch (error) {
      await markFailed(application.id, getErrorMessage(error));
      summary.failed += 1;
    }
  }
}

async function payoutVerifiedApplications(
  summary: WorkerSummary,
  rewardWallet: string,
  dependencies: WorkerDependencies,
): Promise<void> {
  const config = dependencies.getConfig();

  if (config.payoutsPaused) {
    summary.skippedPayouts += (await getVerifiedPendingForPayout()).length;
    return;
  }

  for (const application of await getVerifiedPendingForPayout()) {
    if (await hasTransferredDuplicate(application)) {
      await markDuplication(
        application.id,
        "A transferred application already exists for this resolved L2 address or transaction hash.",
      );
      summary.duplicated += 1;
      continue;
    }

    if (!application.resolvedL2Address) {
      await markFailed(application.id, "Verified application is missing a resolved L2 address.");
      summary.failed += 1;
      continue;
    }

    try {
      const payoutTxHash = await transferRewardWithStaleRetry(
        config,
        rewardWallet,
        application.resolvedL2Address,
        dependencies,
      );

      await markTransferred(application.id, payoutTxHash);
      summary.transferred += 1;
      await syncBudget(summary, rewardWallet, dependencies);
    } catch (error) {
      await markFailed(application.id, getErrorMessage(error));
      summary.failed += 1;
    }
  }
}

async function transferRewardWithStaleRetry(
  config: AppConfig,
  rewardWallet: string,
  recipientL2Address: string,
  dependencies: WorkerDependencies,
): Promise<string> {
  let staleRetries = 0;

  while (true) {
    try {
      return await transferReward(
        config,
        rewardWallet,
        recipientL2Address,
        dependencies,
      );
    } catch (error) {
      if (
        !isStaleWalletWorkspaceError(error) ||
        staleRetries >= maxStaleWorkspaceRetries
      ) {
        throw error;
      }

      staleRetries += 1;
    }
  }
}

async function transferReward(
  config: AppConfig,
  rewardWallet: string,
  recipientL2Address: string,
  dependencies: WorkerDependencies,
): Promise<string> {
  await dependencies.recoverRewardWalletWorkspace(config);

  const notesOutput = await dependencies.getWalletNotes(config, rewardWallet);
  const notes = parseUnusedRewardNotes(notesOutput);

  if (sumRewardNotes(notes) < config.rewardTon) {
    throw new Error("Reward wallet has less than 25 TON in unused notes.");
  }

  const rewardWalletL2Address = needsChangeAddress(notes, config.rewardTon)
    ? await dependencies.getRewardWalletL2Address(config, rewardWallet)
    : recipientL2Address;
  const selection = selectRewardNotes(
    notes,
    config.rewardTon,
    recipientL2Address,
    rewardWalletL2Address,
  );

  return dependencies.transferNotes(
    config,
    rewardWallet,
    selection.noteIds,
    selection.recipients,
    selection.amounts,
  );
}

async function syncBudget(
  summary: WorkerSummary,
  rewardWallet: string,
  dependencies: WorkerDependencies,
): Promise<void> {
  const config = dependencies.getConfig();
  const notesOutput = await dependencies.getWalletNotes(config, rewardWallet);
  const notes = parseUnusedRewardNotes(notesOutput);
  const remainingBudgetTon = sumRewardNotes(notes);
  const transferredCount = await countTransferredApplications();
  const expectedSpentTon = transferredCount * config.rewardTon;

  await upsertBudgetSync({
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

function isStaleWalletWorkspaceError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("workspace is stale") ||
    message.includes("wallet note workspace is stale") ||
    message.includes("still stale after recovery-index sync")
  );
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
