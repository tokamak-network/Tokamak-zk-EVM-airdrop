import assert from "node:assert/strict";
import test from "node:test";

import {
  countApplications,
  createApplication,
  findApplication,
} from "@/lib/applications";
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
