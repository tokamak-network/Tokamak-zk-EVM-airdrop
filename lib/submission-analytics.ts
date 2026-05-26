import { dbAll } from "@/lib/db";
import type { ApplicationStatus } from "@/lib/status";

export type SubmissionAnalyticsApplication = {
  id: string;
  qualifyingTxHash: string;
  resolvedL1Address: string | null;
  resolvedL2Address: string | null;
  status: ApplicationStatus;
  payoutTxHash: string | null;
  createdAt: string;
  updatedAt: string;
  submitterIpHash: string | null;
  submitterIpHashVersion: string | null;
  submitterUserAgentHash: string | null;
  submitterCountry: string | null;
  submitterRegion: string | null;
  submitterCity: string | null;
  ipUserAgentClusterKey: string | null;
  ipUserAgentClusterSize: number;
  ipClusterSize: number;
  ethereumWalletClusterSize: number;
  tonnelChannelClusterSize: number;
};

export type SubmissionCluster = {
  key: string;
  count: number;
  statuses: Record<ApplicationStatus, number>;
  transactionHashes: string[];
  countries: string[];
  regions: string[];
  cities: string[];
};

export type SubmissionAnalytics = {
  summary: {
    totalSubmissions: number;
    submissionsWithIpHash: number;
    uniqueIpHashes: number;
    uniqueIpUserAgentClusters: number;
    uniqueEthereumWalletAddresses: number;
    uniqueTonnelChannelAddresses: number;
    repeatedIpHashClusters: number;
    repeatedIpUserAgentClusters: number;
    repeatedEthereumWalletClusters: number;
    repeatedTonnelChannelClusters: number;
  };
  duplicateClusters: {
    byIpHash: SubmissionCluster[];
    byIpUserAgent: SubmissionCluster[];
    byEthereumWallet: SubmissionCluster[];
    byTonnelChannelAddress: SubmissionCluster[];
  };
  applications: SubmissionAnalyticsApplication[];
};

type AnalyticsRow = {
  id: string;
  qualifying_tx_hash: string;
  resolved_l1_address: string | null;
  resolved_l2_address: string | null;
  status: ApplicationStatus;
  payout_tx_hash: string | null;
  created_at: string;
  updated_at: string;
  submitter_ip_hash: string | null;
  submitter_ip_hash_version: string | null;
  submitter_user_agent_hash: string | null;
  submitter_country: string | null;
  submitter_region: string | null;
  submitter_city: string | null;
};

export async function getSubmissionAnalytics(
  limit = 5000,
): Promise<SubmissionAnalytics> {
  const rows = await listAnalyticsRows(limit);
  const ipGroups = buildGroups(rows, (row) => buildIpHashGroupKey(row));
  const ipUserAgentGroups = buildGroups(rows, (row) =>
    row.submitter_ip_hash && row.submitter_user_agent_hash
      ? `${getIpHashVersion(row)}:${row.submitter_ip_hash}:${row.submitter_user_agent_hash}`
      : null,
  );
  const l1Groups = buildGroups(rows, (row) => row.resolved_l1_address);
  const l2Groups = buildGroups(rows, (row) => row.resolved_l2_address);

  return {
    summary: {
      totalSubmissions: rows.length,
      submissionsWithIpHash: rows.filter((row) => row.submitter_ip_hash).length,
      uniqueIpHashes: ipGroups.size,
      uniqueIpUserAgentClusters: ipUserAgentGroups.size,
      uniqueEthereumWalletAddresses: l1Groups.size,
      uniqueTonnelChannelAddresses: l2Groups.size,
      repeatedIpHashClusters: countRepeatedGroups(ipGroups),
      repeatedIpUserAgentClusters: countRepeatedGroups(ipUserAgentGroups),
      repeatedEthereumWalletClusters: countRepeatedGroups(l1Groups),
      repeatedTonnelChannelClusters: countRepeatedGroups(l2Groups),
    },
    duplicateClusters: {
      byIpHash: repeatedClusters(ipGroups),
      byIpUserAgent: repeatedClusters(ipUserAgentGroups),
      byEthereumWallet: repeatedClusters(l1Groups),
      byTonnelChannelAddress: repeatedClusters(l2Groups),
    },
    applications: rows.map((row) => ({
      id: row.id,
      qualifyingTxHash: row.qualifying_tx_hash,
      resolvedL1Address: row.resolved_l1_address,
      resolvedL2Address: row.resolved_l2_address,
      status: row.status,
      payoutTxHash: row.payout_tx_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submitterIpHash: row.submitter_ip_hash,
      submitterIpHashVersion: row.submitter_ip_hash_version,
      submitterUserAgentHash: row.submitter_user_agent_hash,
      submitterCountry: row.submitter_country,
      submitterRegion: row.submitter_region,
      submitterCity: row.submitter_city,
      ipUserAgentClusterKey:
        row.submitter_ip_hash && row.submitter_user_agent_hash
          ? `${getIpHashVersion(row)}:${row.submitter_ip_hash}:${row.submitter_user_agent_hash}`
          : null,
      ipUserAgentClusterSize: getGroupSize(ipUserAgentGroups, [
        buildIpHashGroupKey(row),
        row.submitter_user_agent_hash,
      ]),
      ipClusterSize: getGroupSize(ipGroups, [buildIpHashGroupKey(row)]),
      ethereumWalletClusterSize: getGroupSize(l1Groups, [row.resolved_l1_address]),
      tonnelChannelClusterSize: getGroupSize(l2Groups, [row.resolved_l2_address]),
    })),
  };
}

async function listAnalyticsRows(limit: number): Promise<AnalyticsRow[]> {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 10000)
    : 5000;

  return dbAll<AnalyticsRow>(
    `
      SELECT
        id,
        qualifying_tx_hash,
        resolved_l1_address,
        resolved_l2_address,
        status,
        payout_tx_hash,
        created_at,
        updated_at,
        submitter_ip_hash,
        submitter_ip_hash_version,
        submitter_user_agent_hash,
        submitter_country,
        submitter_region,
        submitter_city
      FROM applications
      ORDER BY created_at DESC
      LIMIT ?
    `,
    [safeLimit],
  );
}

function buildIpHashGroupKey(row: AnalyticsRow): string | null {
  if (!row.submitter_ip_hash) {
    return null;
  }

  return `${getIpHashVersion(row)}:${row.submitter_ip_hash}`;
}

function getIpHashVersion(row: AnalyticsRow): string {
  return row.submitter_ip_hash_version?.trim() || "legacy";
}

function buildGroups(
  rows: AnalyticsRow[],
  keyFor: (row: AnalyticsRow) => string | null,
): Map<string, AnalyticsRow[]> {
  const groups = new Map<string, AnalyticsRow[]>();

  for (const row of rows) {
    const key = normalizeGroupKey(keyFor(row));

    if (!key) {
      continue;
    }

    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  return groups;
}

function repeatedClusters(groups: Map<string, AnalyticsRow[]>): SubmissionCluster[] {
  return [...groups.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => ({
      key,
      count: rows.length,
      statuses: countStatuses(rows),
      transactionHashes: rows.map((row) => row.qualifying_tx_hash),
      countries: uniqueSorted(rows.map((row) => row.submitter_country)),
      regions: uniqueSorted(rows.map((row) => row.submitter_region)),
      cities: uniqueSorted(rows.map((row) => row.submitter_city)),
    }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function countRepeatedGroups(groups: Map<string, AnalyticsRow[]>): number {
  return [...groups.values()].filter((rows) => rows.length > 1).length;
}

function getGroupSize(
  groups: Map<string, AnalyticsRow[]>,
  keyParts: Array<string | null>,
): number {
  const key = normalizeGroupKey(keyParts.every(Boolean) ? keyParts.join(":") : null);

  return key ? (groups.get(key)?.length ?? 0) : 0;
}

function countStatuses(rows: AnalyticsRow[]): Record<ApplicationStatus, number> {
  return rows.reduce(
    (counts, row) => {
      counts[row.status] += 1;
      return counts;
    },
    {
      Pending: 0,
      Transferred: 0,
      Duplication: 0,
      "Invalid tx": 0,
      Failed: 0,
    } satisfies Record<ApplicationStatus, number>,
  );
}

function uniqueSorted(values: Array<string | null>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b));
}

function normalizeGroupKey(value: string | null): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}
