export const APPLICATION_STATUSES = [
  "Pending",
  "Transferred",
  "Duplication",
  "Failed",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus);
}
