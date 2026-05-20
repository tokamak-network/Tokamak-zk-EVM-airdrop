import assert from "node:assert/strict";
import test from "node:test";

import {
  createApplication,
  findApplication,
  markVerified,
} from "@/lib/applications";
import type { AppConfig } from "@/lib/config";
import { getEventState } from "@/lib/event-state";
import {
  runAirdropWorker,
  type WorkerDependencies,
} from "@/lib/worker";
import { withTempDbAsync } from "./test-utils";

test("runAirdropWorker skips payout transfer when payouts are paused", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"c".repeat(64)}`;
    const created = createApplication({ qualifyingTxHash: txHash });

    markVerified(
      created.application.id,
      "0x0000000000000000000000000000000000000011",
      "0x0000000000000000000000000000000000000022",
    );

    let transferCalled = false;
    let walletNoteCalls = 0;
    const config = createTestConfig({ payoutsPaused: true });
    const dependencies: WorkerDependencies = {
      getConfig: () => config,
      preparePrivateStateCli: async () => {},
      verifySubmittedTransaction: async () => {
        throw new Error("verification should not run for already verified rows");
      },
      resolveRewardWalletName: async () => "reward-wallet",
      getWalletNotes: async () => {
        walletNoteCalls += 1;

        return {
          unusedNotes: [
            { id: "note-1", value: "25" },
            { id: "note-2", value: "25" },
          ],
        };
      },
      getRewardWalletL2Address: async () => {
        throw new Error("change address should not be resolved while payouts are paused");
      },
      transferNotes: async () => {
        transferCalled = true;
        throw new Error("transfer should not run while payouts are paused");
      },
    };

    const summary = await runAirdropWorker(dependencies);
    const application = findApplication(txHash);
    const eventState = getEventState();

    assert.equal(summary.skippedPayouts, 1);
    assert.equal(summary.transferred, 0);
    assert.equal(summary.remainingBudgetTon, 50);
    assert.equal(transferCalled, false);
    assert.equal(walletNoteCalls, 2);
    assert.equal(application?.status, "Pending");
    assert.equal(application?.payoutTxHash, null);
    assert.equal(eventState?.remainingBudgetTon, 50);
    assert.equal(eventState?.lastWorkerError, null);
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
