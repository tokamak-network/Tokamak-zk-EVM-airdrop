import assert from "node:assert/strict";
import test from "node:test";

import {
  createApplication,
  markFailed,
  markTransferred,
  markVerified,
} from "@/lib/applications";
import { getSubmissionAnalytics } from "@/lib/submission-analytics";
import type { SubmissionMetadata } from "@/lib/submission-metadata";
import { withTempDbAsync } from "./test-utils";

test("getSubmissionAnalytics summarizes unique submitters and duplicate clusters", async () => {
  await withTempDbAsync(async () => {
    const first = await createApplication({
      qualifyingTxHash: `0x${"1".repeat(64)}`,
      submitterMetadata: metadata("ip-a", "ua-a", "KR"),
    });
    const second = await createApplication({
      qualifyingTxHash: `0x${"2".repeat(64)}`,
      submitterMetadata: metadata("ip-a", "ua-a", "KR"),
    });
    const third = await createApplication({
      qualifyingTxHash: `0x${"3".repeat(64)}`,
      submitterMetadata: metadata("ip-b", "ua-b", "US"),
    });

    await markVerified(
      first.application.id,
      "0x00000000000000000000000000000000000000a1",
      "0x00000000000000000000000000000000000000b1",
    );
    await markTransferred(first.application.id, `0x${"a".repeat(64)}`);
    await markVerified(
      second.application.id,
      "0x00000000000000000000000000000000000000a1",
      "0x00000000000000000000000000000000000000b2",
    );
    await markFailed(
      third.application.id,
      ["internal_payout_error"],
      "not a transfer notes tx",
    );

    const analytics = await getSubmissionAnalytics();

    assert.equal(analytics.summary.totalSubmissions, 3);
    assert.equal(analytics.summary.submissionsWithIpHash, 3);
    assert.equal(analytics.summary.uniqueIpHashes, 2);
    assert.equal(analytics.summary.uniqueIpUserAgentClusters, 2);
    assert.equal(analytics.summary.uniqueEthereumWalletAddresses, 1);
    assert.equal(analytics.summary.uniqueTonnelChannelAddresses, 2);
    assert.equal(analytics.summary.repeatedIpHashClusters, 1);
    assert.equal(analytics.summary.repeatedIpUserAgentClusters, 1);
    assert.equal(analytics.summary.repeatedEthereumWalletClusters, 1);
    assert.equal(analytics.summary.repeatedTonnelChannelClusters, 0);

    assert.equal(analytics.duplicateClusters.byIpUserAgent.length, 1);
    assert.equal(analytics.duplicateClusters.byIpUserAgent[0]?.count, 2);
    assert.deepEqual(analytics.duplicateClusters.byIpUserAgent[0]?.countries, ["KR"]);
    assert.equal(analytics.duplicateClusters.byEthereumWallet[0]?.count, 2);

    const firstApplication = analytics.applications.find(
      (application) => application.id === first.application.id,
    );
    assert.equal(firstApplication?.ipUserAgentClusterSize, 2);
    assert.equal(firstApplication?.ethereumWalletClusterSize, 2);
    assert.equal(firstApplication?.tonnelChannelClusterSize, 1);
  });
});

function metadata(
  ipHash: string,
  userAgentHash: string,
  country: string,
): SubmissionMetadata {
  return {
    submitterIpHash: ipHash,
    submitterIpHashVersion: "legacy",
    submitterUserAgentHash: userAgentHash,
    submitterCountry: country,
    submitterRegion: null,
    submitterCity: null,
  };
}
