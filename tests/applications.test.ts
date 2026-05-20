import assert from "node:assert/strict";
import test from "node:test";

import {
  countApplications,
  createApplication,
  findApplication,
} from "@/lib/applications";
import { withTempDb } from "./test-utils";

test("createApplication rejects invalid transaction hashes before persistence", () => {
  withTempDb(() => {
    assert.throws(
      () => createApplication({ qualifyingTxHash: "not-a-tx-hash" }),
      /0x-prefixed 32-byte Ethereum transaction hash/,
    );
    assert.equal(countApplications(), 0);
  });
});

test("createApplication stores a valid transaction hash as Pending", () => {
  withTempDb(() => {
    const txHash = `0x${"a".repeat(64)}`;
    const result = createApplication({ qualifyingTxHash: txHash });

    assert.equal(result.created, true);
    assert.equal(result.application.qualifyingTxHash, txHash);
    assert.equal(result.application.status, "Pending");
    assert.equal(countApplications(), 1);
  });
});

test("createApplication returns an existing row for duplicate transaction hashes", () => {
  withTempDb(() => {
    const txHash = `0x${"b".repeat(64)}`;
    const first = createApplication({ qualifyingTxHash: txHash.toUpperCase() });
    const second = createApplication({ qualifyingTxHash: txHash });

    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(second.application.id, first.application.id);
    assert.equal(second.application.qualifyingTxHash, txHash);
    assert.equal(countApplications(), 1);
    assert.equal(findApplication(txHash)?.id, first.application.id);
  });
});
