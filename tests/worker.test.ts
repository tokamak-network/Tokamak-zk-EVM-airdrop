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
    const created = await createApplication({ qualifyingTxHash: txHash });

    await markVerified(
      created.application.id,
      "0x0000000000000000000000000000000000000011",
      "0x0000000000000000000000000000000000000022",
    );

    let transferCalled = false;
    let walletNoteCalls = 0;
    let recoveries = 0;
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
      recoverRewardWalletWorkspace: async () => {
        recoveries += 1;
      },
      transferNotes: async () => {
        transferCalled = true;
        throw new Error("transfer should not run while payouts are paused");
      },
    };

    const summary = await runAirdropWorker(dependencies);
    const application = await findApplication(txHash);
    const eventState = await getEventState();

    assert.equal(summary.skippedPayouts, 1);
    assert.equal(summary.transferred, 0);
    assert.equal(summary.remainingBudgetTon, 50);
    assert.equal(transferCalled, false);
    assert.equal(walletNoteCalls, 2);
    assert.equal(recoveries, 1);
    assert.equal(application?.status, "Pending");
    assert.equal(application?.payoutTxHash, null);
    assert.equal(eventState?.remainingBudgetTon, 50);
    assert.equal(eventState?.lastWorkerError, null);
  });
});

test("runAirdropWorker marks ineligible submitted transactions as Invalid tx", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"a".repeat(64)}`;
    await createApplication({ qualifyingTxHash: txHash });

    const config = createTestConfig();
    const dependencies: WorkerDependencies = {
      getConfig: () => config,
      preparePrivateStateCli: async () => {},
      verifySubmittedTransaction: async () => ({
        valid: false,
        reason: "Transaction was not sent to Tonnel channel manager.",
      }),
      resolveRewardWalletName: async () => "reward-wallet",
      getWalletNotes: async () => ({
        unusedNotes: [{ id: "note-1", value: "25" }],
      }),
      getRewardWalletL2Address: async () => {
        throw new Error("change address should not be resolved without a payout");
      },
      recoverRewardWalletWorkspace: async () => {},
      transferNotes: async () => {
        throw new Error("transfer should not run for invalid transactions");
      },
    };

    const summary = await runAirdropWorker(dependencies);
    const application = await findApplication(txHash);

    assert.equal(summary.invalidTx, 1);
    assert.equal(summary.failed, 0);
    assert.equal(summary.transferred, 0);
    assert.equal(application?.status, "Invalid tx");
    assert.equal(application?.reason, "Transaction was not sent to Tonnel channel manager.");
  });
});

test("runAirdropWorker recovers the reward wallet workspace before budget sync and transfer", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"d".repeat(64)}`;
    const created = await createApplication({ qualifyingTxHash: txHash });

    await markVerified(
      created.application.id,
      "0x0000000000000000000000000000000000000011",
      "0x0000000000000000000000000000000000000022",
    );

    const calls: string[] = [];
    const config = createTestConfig();
    const dependencies: WorkerDependencies = {
      getConfig: () => config,
      preparePrivateStateCli: async () => {
        calls.push("prepare");
      },
      verifySubmittedTransaction: async () => {
        throw new Error("verification should not run for already verified rows");
      },
      resolveRewardWalletName: async () => "reward-wallet",
      getWalletNotes: async () => ({
        unusedNotes: [{ id: "note-1", value: "25" }],
      }),
      getRewardWalletL2Address: async () => {
        throw new Error("change address should not be resolved for an exact note");
      },
      recoverRewardWalletWorkspace: async () => {
        calls.push("recover");
      },
      transferNotes: async () => {
        calls.push("transfer");
        return `0x${"e".repeat(64)}`;
      },
    };

    const summary = await runAirdropWorker(dependencies);
    const application = await findApplication(txHash);

    assert.equal(summary.transferred, 1);
    assert.equal(application?.status, "Transferred");
    assert.deepEqual(calls, ["prepare", "recover", "recover", "transfer"]);
  });
});

test("runAirdropWorker retries stale wallet workspace failures up to five times", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"f".repeat(64)}`;
    const created = await createApplication({ qualifyingTxHash: txHash });

    await markVerified(
      created.application.id,
      "0x0000000000000000000000000000000000000011",
      "0x0000000000000000000000000000000000000022",
    );

    let recoveries = 0;
    let transfers = 0;
    const config = createTestConfig();
    const dependencies: WorkerDependencies = {
      getConfig: () => config,
      preparePrivateStateCli: async () => {},
      verifySubmittedTransaction: async () => {
        throw new Error("verification should not run for already verified rows");
      },
      resolveRewardWalletName: async () => "reward-wallet",
      getWalletNotes: async () => ({
        unusedNotes: [{ id: "note-1", value: "25" }],
      }),
      getRewardWalletL2Address: async () => {
        throw new Error("change address should not be resolved for an exact note");
      },
      recoverRewardWalletWorkspace: async () => {
        recoveries += 1;
      },
      transferNotes: async () => {
        transfers += 1;

        if (transfers <= 5) {
          throw new Error("Wallet note workspace is stale. Run wallet recover-workspace before using commands that read or spend wallet notes.");
        }

        return `0x${"1".repeat(64)}`;
      },
    };

    const summary = await runAirdropWorker(dependencies);
    const application = await findApplication(txHash);

    assert.equal(summary.transferred, 1);
    assert.equal(summary.failed, 0);
    assert.equal(recoveries, 7);
    assert.equal(transfers, 6);
    assert.equal(application?.status, "Transferred");
    assert.equal(application?.payoutTxHash, `0x${"1".repeat(64)}`);
  });
});

test("runAirdropWorker retries UnexpectedCurrentRootVector transfer failures", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"4".repeat(64)}`;
    const created = await createApplication({ qualifyingTxHash: txHash });

    await markVerified(
      created.application.id,
      "0x0000000000000000000000000000000000000011",
      "0x0000000000000000000000000000000000000022",
    );

    let recoveries = 0;
    let transfers = 0;
    const config = createTestConfig();
    const dependencies: WorkerDependencies = {
      getConfig: () => config,
      preparePrivateStateCli: async () => {},
      verifySubmittedTransaction: async () => {
        throw new Error("verification should not run for already verified rows");
      },
      resolveRewardWalletName: async () => "reward-wallet",
      getWalletNotes: async () => ({
        unusedNotes: [{ id: "note-1", value: "25" }],
      }),
      getRewardWalletL2Address: async () => {
        throw new Error("change address should not be resolved for an exact note");
      },
      recoverRewardWalletWorkspace: async () => {
        recoveries += 1;
      },
      transferNotes: async () => {
        transfers += 1;

        if (transfers === 1) {
          throw new Error("execution reverted: UnexpectedCurrentRootVector()");
        }

        if (transfers === 2) {
          throw new Error(
            'execution reverted (unknown custom error) (action="estimateGas", data="0x8b1a1fc7", reason=null)',
          );
        }

        return `0x${"4".repeat(64)}`;
      },
    };

    const summary = await runAirdropWorker(dependencies);
    const application = await findApplication(txHash);

    assert.equal(summary.transferred, 1);
    assert.equal(summary.failed, 0);
    assert.equal(recoveries, 4);
    assert.equal(transfers, 3);
    assert.equal(application?.status, "Transferred");
    assert.equal(application?.payoutTxHash, `0x${"4".repeat(64)}`);
  });
});

test("runAirdropWorker fails after five stale wallet workspace retries", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"3".repeat(64)}`;
    const created = await createApplication({ qualifyingTxHash: txHash });

    await markVerified(
      created.application.id,
      "0x0000000000000000000000000000000000000011",
      "0x0000000000000000000000000000000000000022",
    );

    let transfers = 0;
    const config = createTestConfig();
    const dependencies: WorkerDependencies = {
      getConfig: () => config,
      preparePrivateStateCli: async () => {},
      verifySubmittedTransaction: async () => {
        throw new Error("verification should not run for already verified rows");
      },
      resolveRewardWalletName: async () => "reward-wallet",
      getWalletNotes: async () => ({
        unusedNotes: [{ id: "note-1", value: "25" }],
      }),
      getRewardWalletL2Address: async () => {
        throw new Error("change address should not be resolved for an exact note");
      },
      recoverRewardWalletWorkspace: async () => {},
      transferNotes: async () => {
        transfers += 1;
        throw new Error("Wallet note workspace is stale.");
      },
    };

    const summary = await runAirdropWorker(dependencies);
    const application = await findApplication(txHash);

    assert.equal(summary.transferred, 0);
    assert.equal(summary.failed, 1);
    assert.equal(transfers, 6);
    assert.equal(application?.status, "Failed");
    assert.equal(application?.reason, "Wallet note workspace is stale.");
  });
});

test("runAirdropWorker does not retry non-stale transfer failures", async () => {
  await withTempDbAsync(async () => {
    const txHash = `0x${"2".repeat(64)}`;
    const created = await createApplication({ qualifyingTxHash: txHash });

    await markVerified(
      created.application.id,
      "0x0000000000000000000000000000000000000011",
      "0x0000000000000000000000000000000000000022",
    );

    let transfers = 0;
    const config = createTestConfig();
    const dependencies: WorkerDependencies = {
      getConfig: () => config,
      preparePrivateStateCli: async () => {},
      verifySubmittedTransaction: async () => {
        throw new Error("verification should not run for already verified rows");
      },
      resolveRewardWalletName: async () => "reward-wallet",
      getWalletNotes: async () => ({
        unusedNotes: [{ id: "note-1", value: "25" }],
      }),
      getRewardWalletL2Address: async () => {
        throw new Error("change address should not be resolved for an exact note");
      },
      recoverRewardWalletWorkspace: async () => {},
      transferNotes: async () => {
        transfers += 1;
        throw new Error("Transaction reverted.");
      },
    };

    const summary = await runAirdropWorker(dependencies);
    const application = await findApplication(txHash);

    assert.equal(summary.transferred, 0);
    assert.equal(summary.failed, 1);
    assert.equal(transfers, 1);
    assert.equal(application?.status, "Failed");
    assert.equal(application?.reason, "Transaction reverted.");
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
