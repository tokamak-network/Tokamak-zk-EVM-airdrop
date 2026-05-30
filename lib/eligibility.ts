import {
  hasSubmittedTransaction,
  hasTransferredL2Address,
} from "@/lib/applications";
import { type AppConfig, getConfig } from "@/lib/config";
import {
  verifySubmittedTransaction,
  type VerificationResult,
} from "@/lib/rpc-verifier";

export type EligibilityCheckResult =
  | {
      eligible: true;
      reason: null;
    }
  | {
      eligible: false;
      reason:
        | "Transaction duplicate"
        | "Transaction ineligible"
        | "Tonnel channel address duplicate";
    };

type EligibilityDependencies = {
  getConfig?: () => AppConfig;
  verifySubmittedTransaction?: (
    config: AppConfig,
    txHash: string,
  ) => Promise<VerificationResult>;
  hasSubmittedTransaction?: (qualifyingTxHash: string) => Promise<boolean>;
  hasTransferredL2Address?: (resolvedL2Address: string) => Promise<boolean>;
};

export async function checkEligibility(
  qualifyingTxHash: string,
  dependencies: EligibilityDependencies = {},
): Promise<EligibilityCheckResult> {
  const config = (dependencies.getConfig ?? getConfig)();
  const verify = dependencies.verifySubmittedTransaction ?? verifySubmittedTransaction;
  const submittedTransactionCheck =
    dependencies.hasSubmittedTransaction ?? hasSubmittedTransaction;
  const transferredL2Check =
    dependencies.hasTransferredL2Address ?? hasTransferredL2Address;
  const normalizedTxHash = qualifyingTxHash.trim();

  if (await submittedTransactionCheck(normalizedTxHash)) {
    return {
      eligible: false,
      reason: "Transaction duplicate",
    };
  }

  const verification = await verify(config, normalizedTxHash);

  if (!verification.valid) {
    return {
      eligible: false,
      reason: "Transaction ineligible",
    };
  }

  if (await transferredL2Check(verification.resolvedL2Address)) {
    return {
      eligible: false,
      reason: "Tonnel channel address duplicate",
    };
  }

  return {
    eligible: true,
    reason: null,
  };
}
