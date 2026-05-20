import { hasTransferredL2Address } from "@/lib/applications";
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
      reason: "Transaction ineligible" | "L2 address duplicate";
    };

type EligibilityDependencies = {
  getConfig?: () => AppConfig;
  verifySubmittedTransaction?: (
    config: AppConfig,
    txHash: string,
  ) => Promise<VerificationResult>;
  hasTransferredL2Address?: (resolvedL2Address: string) => Promise<boolean>;
};

export async function checkEligibility(
  qualifyingTxHash: string,
  dependencies: EligibilityDependencies = {},
): Promise<EligibilityCheckResult> {
  const config = (dependencies.getConfig ?? getConfig)();
  const verify = dependencies.verifySubmittedTransaction ?? verifySubmittedTransaction;
  const duplicateCheck =
    dependencies.hasTransferredL2Address ?? hasTransferredL2Address;
  const verification = await verify(config, qualifyingTxHash.trim());

  if (!verification.valid) {
    return {
      eligible: false,
      reason: "Transaction ineligible",
    };
  }

  if (await duplicateCheck(verification.resolvedL2Address)) {
    return {
      eligible: false,
      reason: "L2 address duplicate",
    };
  }

  return {
    eligible: true,
    reason: null,
  };
}
