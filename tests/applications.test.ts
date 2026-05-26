import assert from "node:assert/strict";
import test from "node:test";

import {
  countApplications,
  createApplication,
  findApplication,
} from "@/lib/applications";
import { dbGet } from "@/lib/db";
import { buildSubmissionMetadata } from "@/lib/submission-metadata";
import { withTempDbAsync } from "./test-utils";

test("createApplication rejects invalid transaction hashes before persistence", async () => {
  await withTempDbAsync(async () => {
    await assert.rejects(
      () => createApplication({ qualifyingTxHash: "not-a-tx-hash" }),
      /0x-prefixed 32-byte Ethereum transaction hash/,
    );
    assert.equal(await countApplications(), 0);
  });
});

test("createApplication stores a valid transaction hash as Pending", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"a".repeat(64)}`;
    const result = await createApplication({ qualifyingTxHash: txHash });

    assert.equal(result.created, true);
    assert.equal(result.application.qualifyingTxHash, txHash);
    assert.equal(result.application.status, "Pending");
    assert.equal(await countApplications(), 1);
  });
});

test("createApplication returns an existing row for duplicate transaction hashes", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"b".repeat(64)}`;
    const first = await createApplication({ qualifyingTxHash: txHash.toUpperCase() });
    const second = await createApplication({ qualifyingTxHash: txHash });

    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(second.application.id, first.application.id);
    assert.equal(second.application.qualifyingTxHash, txHash);
    assert.equal(await countApplications(), 1);
    assert.equal((await findApplication(txHash))?.id, first.application.id);
  });
});

test("createApplication stores hashed submitter metadata without raw IP or user agent", async () => {
  await withTempDbAsync(async () => {
    const previousSecret = process.env.SUBMISSION_METADATA_SECRET;
    process.env.SUBMISSION_METADATA_SECRET = "test-submission-metadata-secret";

    try {
      const request = new Request("https://example.test/api/applications", {
        headers: {
          "user-agent": "UnitTest Browser",
          "x-forwarded-for": "203.0.113.10, 198.51.100.20",
          "x-vercel-ip-country": "kr",
          "x-vercel-ip-country-region": "Seoul",
          "x-vercel-ip-city": "Seoul",
        },
      });
      const txHash = `0x${"c".repeat(64)}`;

      await createApplication({
        qualifyingTxHash: txHash,
        submitterMetadata: buildSubmissionMetadata(request),
      });

      const row = await dbGet<{
        submitter_ip_hash: string | null;
        submitter_ip_hash_version: string | null;
        submitter_user_agent_hash: string | null;
        submitter_country: string | null;
        submitter_region: string | null;
        submitter_city: string | null;
      }>(
        `
          SELECT
            submitter_ip_hash,
            submitter_ip_hash_version,
            submitter_user_agent_hash,
            submitter_country,
            submitter_region,
            submitter_city
          FROM applications
          WHERE qualifying_tx_hash = ?
        `,
        [txHash],
      );

      assert.ok(row?.submitter_ip_hash);
      assert.ok(row?.submitter_user_agent_hash);
      assert.notEqual(row.submitter_ip_hash, "203.0.113.10");
      assert.notEqual(row.submitter_user_agent_hash, "UnitTest Browser");
      assert.equal(row.submitter_ip_hash_version, "legacy");
      assert.equal(row.submitter_country, "KR");
      assert.equal(row.submitter_region, "Seoul");
      assert.equal(row.submitter_city, "Seoul");
    } finally {
      if (previousSecret === undefined) {
        delete process.env.SUBMISSION_METADATA_SECRET;
      } else {
        process.env.SUBMISSION_METADATA_SECRET = previousSecret;
      }
    }
  });
});

test("buildSubmissionMetadata hashes canonical client IP values", async () => {
  const previousSecret = process.env.SUBMISSION_METADATA_SECRET;
  const previousSecretId = process.env.SUBMISSION_METADATA_SECRET_ID;
  process.env.SUBMISSION_METADATA_SECRET = "test-submission-metadata-secret";
  process.env.SUBMISSION_METADATA_SECRET_ID = "test-secret-v2";

  try {
    const direct = buildSubmissionMetadata(
      new Request("https://example.test/api/applications", {
        headers: {
          "x-forwarded-for": "203.0.113.10",
        },
      }),
    );
    const mappedWithPort = buildSubmissionMetadata(
      new Request("https://example.test/api/applications", {
        headers: {
          "x-forwarded-for": "[::ffff:203.0.113.10]:443",
        },
      }),
    );

    assert.equal(mappedWithPort.submitterIpHash, direct.submitterIpHash);
    assert.equal(mappedWithPort.submitterIpHashVersion, "test-secret-v2");
  } finally {
    if (previousSecret === undefined) {
      delete process.env.SUBMISSION_METADATA_SECRET;
    } else {
      process.env.SUBMISSION_METADATA_SECRET = previousSecret;
    }

    if (previousSecretId === undefined) {
      delete process.env.SUBMISSION_METADATA_SECRET_ID;
    } else {
      process.env.SUBMISSION_METADATA_SECRET_ID = previousSecretId;
    }
  }
});
