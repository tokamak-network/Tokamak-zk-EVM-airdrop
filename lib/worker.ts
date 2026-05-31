import {
  countTransferredApplications,
  getApplicationById,
  getNextPendingApplication,
  getTransferredDuplicateReasons,
  markFailed,
  markTransferred,
  markVerified,
} from "@/lib/applications";
import type { Application } from "@/lib/applications";
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
import { FAILURE_REASONS, type FailureReason } from "@/lib/status";

export type WorkerSummary = {
  verified: number;
  transferred: number;
  failed: number;
  skippedPayouts: number;
  remainingBudgetTon: number | null;
  failureReasons: Record<FailureReason, number>;
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
    failed: 0,
    skippedPayouts: 0,
    remainingBudgetTon: null,
    failureReasons: createFailureReasonCounts(),
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

  const rewardWallet = await dependencies.resolveRewardWalletName(config);
  await syncBudget(summary, rewardWallet, dependencies);

  while (true) {
    const application = await getNextPendingApplication();

    if (!application) {
      break;
    }

    const shouldContinue = await processApplication(
      application,
      summary,
      rewardWallet,
      dependencies,
    );
    await syncBudget(summary, rewardWallet, dependencies);

    if (!shouldContinue) {
      break;
    }
  }
}

async function processApplication(
  application: Application,
  summary: WorkerSummary,
  rewardWallet: string,
  dependencies: WorkerDependencies,
): Promise<boolean> {
  const config = dependencies.getConfig();
  let current = application;

  if (!current.verifiedAt) {
    const verificationCompleted = await verifyApplication(
      current,
      summary,
      dependencies,
    );

    if (!verificationCompleted) {
      return true;
    }

    current = (await getApplicationById(current.id)) ?? current;
  }

  if (config.payoutsPaused) {
    summary.skippedPayouts += 1;
    return false;
  }

  const duplicateReasons = await getTransferredDuplicateReasons(current);

  if (duplicateReasons.length > 0) {
    await failApplication(current.id, duplicateReasons, null, summary);
    return true;
  }

  if (!current.resolvedL2Address) {
    await failApplication(
      current.id,
      ["internal_payout_error"],
      "Verified application is missing a resolved Tonnel channel address.",
      summary,
    );
    return true;
  }

  try {
    const payoutTxHash = await transferRewardWithStaleRetry(
      config,
      rewardWallet,
      current.resolvedL2Address,
      dependencies,
    );

    await markTransferred(current.id, payoutTxHash);
    summary.transferred += 1;
  } catch (error) {
    const message = getErrorMessage(error);
    const reason: FailureReason = isRecipientCannotReceiveNotesError(error)
      ? "reward_channel_address_unresolved"
      : "internal_payout_error";

    await failApplication(current.id, [reason], message, summary);
  }

  return true;
}

async function verifyApplication(
  application: Application,
  summary: WorkerSummary,
  dependencies: WorkerDependencies,
): Promise<boolean> {
  const config = dependencies.getConfig();

  try {
    const result = await dependencies.verifySubmittedTransaction(
      config,
      application.qualifyingTxHash,
    );

    if (!result.valid) {
      const reason = classifyVerificationFailureReason(result.reason);

      await failApplication(application.id, [reason], result.reason, summary);
      return false;
    }

    await markVerified(
      application.id,
      result.resolvedL1Address,
      result.resolvedL2Address,
    );
    summary.verified += 1;
    return true;
  } catch (error) {
    await failApplication(
      application.id,
      ["internal_payout_error"],
      getErrorMessage(error),
      summary,
    );
    return false;
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
        !isRecoverableWorkspaceError(error) ||
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

function isRecoverableWorkspaceError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("workspace is stale") ||
    message.includes("wallet note workspace is stale") ||
    message.includes("still stale after recovery-index sync") ||
    message.includes("unexpectedcurrentrootvector") ||
    message.includes("0x8b1a1fc7")
  );
}

function isSubmitterNotJoinedReason(reason: string): boolean {
  return reason === "Transaction submitter is not currently registered in Tonnel.";
}

function classifyVerificationFailureReason(reason: string): FailureReason {
  if (isSubmitterNotJoinedReason(reason)) {
    return "reward_channel_address_unresolved";
  }

  if (isInvalidSubmissionReason(reason)) {
    return "invalid_submission_transaction";
  }

  return "internal_payout_error";
}

function isInvalidSubmissionReason(reason: string): boolean {
  return invalidSubmissionReasonMessages.has(reason);
}

const invalidSubmissionReasonMessages = new Set([
  "Submitted value is not a transaction hash.",
  "Transaction was not found by RPC.",
  "Transaction receipt was not found by RPC.",
  "Transaction did not succeed.",
  "Transaction does not call a contract.",
  "Transaction was not sent to Tonnel channel manager.",
  "Transaction calldata is not executeChannelTransaction.",
  "Could not read private-state function selector from transaction metadata.",
  "Transaction is not a private-state transfer notes transaction.",
  "Transaction block number is missing.",
  "Transaction block was not found by RPC.",
  "Transaction is outside the eligible event window.",
]);

function isRecipientCannotReceiveNotesError(error: unknown): boolean {
  return getErrorMessage(error)
    .toLowerCase()
    .includes("missing a registered note-receive public key");
}

async function failApplication(
  id: string,
  reasons: FailureReason[],
  rawReason: string | null,
  summary: WorkerSummary,
): Promise<void> {
  await markFailed(id, reasons, rawReason);
  summary.failed += 1;

  for (const reason of reasons) {
    summary.failureReasons[reason] += 1;
  }
}

function createFailureReasonCounts(): Record<FailureReason, number> {
  return Object.fromEntries(
    FAILURE_REASONS.map((reason) => [reason, 0]),
  ) as Record<FailureReason, number>;
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
