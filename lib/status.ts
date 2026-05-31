export const APPLICATION_STATUSES = [
  "Pending",
  "Transferred",
  "Failed",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus);
}

export const FAILURE_REASONS = [
  "reward_channel_address_unresolved",
  "invalid_submission_transaction",
  "reward_budget_exhausted",
  "duplicate_transaction",
  "duplicate_channel_account",
  "internal_payout_error",
] as const;

export type FailureReason = (typeof FAILURE_REASONS)[number];

export const failureReasonMessages: Record<FailureReason, string> = {
  reward_channel_address_unresolved:
    "The reward recipient Tonnel channel address could not be resolved.",
  invalid_submission_transaction:
    "The submitted transaction is not an eligible Tonnel transfer notes transaction.",
  reward_budget_exhausted:
    "The reward budget was exhausted before this submission could be paid.",
  duplicate_transaction:
    "This transaction hash has already been submitted or rewarded.",
  duplicate_channel_account:
    "This channel account has already been submitted or rewarded.",
  internal_payout_error:
    "Reward payment failed due to an internal payout error. This is expected to be fixed soon.",
};

export function isFailureReason(value: string): value is FailureReason {
  return FAILURE_REASONS.includes(value as FailureReason);
}
