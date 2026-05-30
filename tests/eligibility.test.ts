import assert from "node:assert/strict";
import test from "node:test";

import {
  createApplication,
  markTransferred,
  markVerified,
} from "@/lib/applications";
import type { AppConfig } from "@/lib/config";
import { checkEligibility } from "@/lib/eligibility";
import type { VerificationResult } from "@/lib/rpc-verifier";
import { withTempDbAsync } from "./test-utils";

const config = createTestConfig();

test("checkEligibility reports transaction duplicate before worker verification", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"f".repeat(64)}`;

    await createApplication({ qualifyingTxHash: txHash });

    let verificationCalled = false;
    const result = await checkEligibility(txHash, {
      getConfig: () => config,
      verifySubmittedTransaction: async (): Promise<VerificationResult> => {
        verificationCalled = true;

        return {
          valid: false,
          reason: "verification should not run for duplicated tx hashes",
        };
      },
    });

    assert.equal(verificationCalled, false);
    assert.deepEqual(result, {
      eligible: false,
      reason: "Transaction duplicate",
    });
  });
});

test("checkEligibility reports transaction ineligible when worker verification rejects", async () => {
  const result = await checkEligibility(`0x${"a".repeat(64)}`, {
    getConfig: () => config,
    verifySubmittedTransaction: async (): Promise<VerificationResult> => ({
      valid: false,
      reason: "Transaction is not a private-state transfer notes transaction.",
    }),
  });

  assert.deepEqual(result, {
    eligible: false,
    reason: "Transaction ineligible",
  });
});

test("checkEligibility reports duplicate when the resolved Tonnel channel address was already transferred", async () => {
  await withTempDbAsync(async () => {
    const existing = await createApplication({
      qualifyingTxHash: `0x${"b".repeat(64)}`,
    });
    const resolvedL2Address = "0x0000000000000000000000000000000000000022";

    await markVerified(
      existing.application.id,
      "0x0000000000000000000000000000000000000011",
      resolvedL2Address,
    );
    await markTransferred(existing.application.id, `0x${"c".repeat(64)}`);

    const result = await checkEligibility(`0x${"d".repeat(64)}`, {
      getConfig: () => config,
      verifySubmittedTransaction: async (): Promise<VerificationResult> => ({
        valid: true,
        resolvedL1Address: "0x0000000000000000000000000000000000000033",
        resolvedL2Address,
      }),
    });

    assert.deepEqual(result, {
      eligible: false,
      reason: "Tonnel channel address duplicate",
    });
  });
});

test("checkEligibility accepts a verified transaction with no transferred Tonnel channel address duplicate", async () => {
  await withTempDbAsync(async () => {
    const result = await checkEligibility(`0x${"e".repeat(64)}`, {
      getConfig: () => config,
      verifySubmittedTransaction: async (): Promise<VerificationResult> => ({
        valid: true,
        resolvedL1Address: "0x0000000000000000000000000000000000000011",
        resolvedL2Address: "0x0000000000000000000000000000000000000022",
      }),
    });

    assert.deepEqual(result, {
      eligible: true,
      reason: null,
    });
  });
});

function createTestConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    channel: "the-great-first-channel",
    network: "mainnet",
    rewardTon: 25,
    totalBudgetTon: 5000,
    dbPath: process.env.AIRDROP_DB_PATH ?? "",
    payoutsPaused: false,
    operatorToken: undefined,
    rpcUrl: "https://example.test/rpc",
    rpcProvider: undefined,
    rpcConfigPath: "/tmp/rpc-config.env",
    rpcConfigSource: "env",
    rpcBlockRangeCap: 1000,
    channelGenesisBlock: 25018368,
    channelManagerAddress: "0x3108d92A38bFb4B3396DE7ad4D92318a8fbE61D7",
    cliArtifactDir: "/tmp/private-state-artifacts",
    rewardAccount: "account2",
    rewardPrivateKeyFile: "/tmp/account2.key",
    rewardWallet: "reward-wallet",
    ...overrides,
  };
}
