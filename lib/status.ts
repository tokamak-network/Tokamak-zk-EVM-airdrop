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
  "submitter_not_joined",
  "recipient_cannot_receive_notes",
  "duplicate_transaction",
  "duplicate_channel_account",
  "internal_payout_error",
] as const;

export type FailureReason = (typeof FAILURE_REASONS)[number];

export const failureReasonMessages: Record<FailureReason, string> = {
  submitter_not_joined:
    "The transfer-notes transaction is valid, but the submitting wallet is not currently joined to the channel, so the reward recipient could not be confirmed.",
  recipient_cannot_receive_notes:
    "The reward recipient address was found, but it is not currently ready to receive private notes in the channel.",
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
