import { getConfig } from "@/lib/config";
import { runJsonCommand } from "@/lib/commands";
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

type VerificationOutput = {
  valid: boolean;
  reason?: string;
};

type PayoutOutput = {
  txHash?: string;
  payoutTxHash?: string;
};

export type WorkerSummary = {
  verified: number;
  transferred: number;
  duplicated: number;
  failed: number;
  skippedPayouts: number;
};

export async function runAirdropWorker(): Promise<WorkerSummary> {
  const summary: WorkerSummary = {
    verified: 0,
    transferred: 0,
    duplicated: 0,
    failed: 0,
    skippedPayouts: 0,
  };

  await verifyPendingApplications(summary);
  await payoutVerifiedApplications(summary);

  return summary;
}

async function verifyPendingApplications(summary: WorkerSummary): Promise<void> {
  const config = getConfig();

  if (!config.verifyCommand) {
    throw new Error("PRIVATE_STATE_VERIFY_COMMAND is not configured.");
  }

  for (const application of getPendingForVerification()) {
    try {
      const result = await runJsonCommand<VerificationOutput>(
        config.verifyCommand,
        {
          channel: config.channel,
          l2Address: application.l2Address,
          txHash: application.qualifyingTxHash,
        },
      );

      if (result.valid) {
        markVerified(application.id);
        summary.verified += 1;
      } else {
        markFailed(application.id, result.reason ?? "Verification failed.");
        summary.failed += 1;
      }
    } catch (error) {
      markFailed(application.id, getErrorMessage(error));
      summary.failed += 1;
    }
  }
}

async function payoutVerifiedApplications(summary: WorkerSummary): Promise<void> {
  const config = getConfig();

  if (config.payoutsPaused) {
    summary.skippedPayouts += getVerifiedPendingForPayout().length;
    return;
  }

  if (!config.payoutCommand) {
    throw new Error("PRIVATE_STATE_PAYOUT_COMMAND is not configured.");
  }

  for (const application of getVerifiedPendingForPayout()) {
    if (hasTransferredDuplicate(application)) {
      markDuplication(
        application.id,
        "A transferred application already exists for this L2 address or transaction hash.",
      );
      summary.duplicated += 1;
      continue;
    }

    const paidTon = countTransferredApplications() * config.rewardTon;

    if (paidTon + config.rewardTon > config.totalBudgetTon) {
      markFailed(application.id, "Airdrop budget exhausted.");
      summary.failed += 1;
      continue;
    }

    try {
      const result = await runJsonCommand<PayoutOutput>(config.payoutCommand, {
        amountTon: config.rewardTon,
        channel: config.channel,
        l2Address: application.l2Address,
        txHash: application.qualifyingTxHash,
      });
      const payoutTxHash = result.txHash ?? result.payoutTxHash;

      if (!payoutTxHash) {
        throw new Error("Payout command did not return txHash.");
      }

      markTransferred(application.id, payoutTxHash);
      summary.transferred += 1;
    } catch (error) {
      markFailed(application.id, getErrorMessage(error));
      summary.failed += 1;
    }
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error.";
}
