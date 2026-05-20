import assert from "node:assert/strict";
import test from "node:test";

import { getAddress, Interface } from "ethers";

import type { AppConfig } from "@/lib/config";
import {
  verifySubmittedTransaction,
  type VerificationLog,
  type VerificationProvider,
  type VerificationReceipt,
  type VerificationTransaction,
} from "@/lib/rpc-verifier";

const manager = getAddress("0x3108d92A38bFb4B3396DE7ad4D92318a8fbE61D7");
const otherContract = getAddress("0x0000000000000000000000000000000000000100");
const l1Address = getAddress("0x0000000000000000000000000000000000000001");
const firstL2Address = getAddress("0x0000000000000000000000000000000000000002");
const secondL2Address = getAddress("0x0000000000000000000000000000000000000003");
const txHash = `0x${"1".repeat(64)}`;
const transferSelector = "0x12345678";
const mintSelector = "0x87654321";

const bridgeInterface = new Interface([
  "function executeChannelTransaction((bytes data) payload,(bytes4 functionSig) functionProof)",
  "function otherFunction()",
  "event ChannelTokenVaultIdentityRegistered(address indexed l1Address,address l2Address,uint256 channelTokenVaultKey,uint256 leafIndex,uint256 joinTollPaid,uint256 joinedAt,uint256 noteReceivePubKeyX,bool noteReceivePubKeyYParity)",
  "event ChannelTokenVaultIdentityExited(address indexed l1Address,uint256 leafIndex)",
]);

test("verifySubmittedTransaction accepts a transferNotes tx and resolves the active participation epoch L2 address", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({
          blockNumber: 40,
          data: encodeExecute(transferSelector),
        }),
        logs: [
          createRegisteredLog(10, 0, l1Address, firstL2Address),
          createExitedLog(20, 0, l1Address),
          createRegisteredLog(30, 0, l1Address, secondL2Address),
        ],
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assert.deepEqual(result, {
    valid: true,
    resolvedL1Address: l1Address,
    resolvedL2Address: secondL2Address,
  });
});

test("verifySubmittedTransaction rejects failed receipts", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({ data: encodeExecute(transferSelector) }),
        receipt: { status: 0 },
        logs: [createRegisteredLog(10, 0, l1Address, firstL2Address)],
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(result, "Transaction did not succeed.");
});

test("verifySubmittedTransaction rejects transactions sent to another contract", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({
          to: otherContract,
          data: encodeExecute(transferSelector),
        }),
        logs: [createRegisteredLog(10, 0, l1Address, firstL2Address)],
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(result, "Transaction was not sent to Tonnel channel manager.");
});

test("verifySubmittedTransaction rejects channel-manager calldata that is not executeChannelTransaction", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({
          data: bridgeInterface.encodeFunctionData("otherFunction", []),
        }),
        logs: [createRegisteredLog(10, 0, l1Address, firstL2Address)],
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(result, "Transaction calldata is not executeChannelTransaction.");
});

test("verifySubmittedTransaction rejects non-transferNotes private-state selectors", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({ data: encodeExecute(mintSelector) }),
        logs: [createRegisteredLog(10, 0, l1Address, firstL2Address)],
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(result, "Transaction is not a private-state transfer notes transaction.");
});

test("verifySubmittedTransaction rejects transferNotes txs when submitter was never a participant", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({ data: encodeExecute(transferSelector) }),
        logs: [],
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(
    result,
    "Transaction submitter was not a Tonnel participant when the transaction happened.",
  );
});

test("verifySubmittedTransaction rejects transferNotes txs after the submitter exited", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({
          blockNumber: 30,
          data: encodeExecute(transferSelector),
        }),
        logs: [
          createRegisteredLog(10, 0, l1Address, firstL2Address),
          createExitedLog(20, 0, l1Address),
        ],
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(
    result,
    "Transaction submitter was not a Tonnel participant when the transaction happened.",
  );
});

function createConfig(): AppConfig {
  return {
    channel: "the-great-first-channel",
    network: "mainnet",
    rewardTon: 25,
    totalBudgetTon: 5000,
    dbPath: "/tmp/airdrop.sqlite",
    payoutsPaused: false,
    rpcUrl: "https://rpc.example.test",
    rpcProvider: undefined,
    rpcConfigPath: "/tmp/rpc-config.env",
    rpcConfigSource: "env",
    rpcBlockRangeCap: 10,
    channelGenesisBlock: 1,
    channelManagerAddress: manager,
    cliArtifactDir: "/tmp/private-state-artifacts",
    rewardAccount: "account2",
    rewardPrivateKeyFile: "/tmp/account2.key",
    rewardWallet: "reward-wallet",
  };
}

function createProvider(input: {
  transaction: VerificationTransaction | null;
  receipt?: VerificationReceipt | null;
  logs?: VerificationLog[];
}): VerificationProvider {
  const logs = input.logs ?? [];

  return {
    async getTransaction() {
      return input.transaction;
    },
    async getTransactionReceipt() {
      return input.receipt === undefined ? { status: 1 } : input.receipt;
    },
    async getLogs(filter) {
      return logs.filter((log) => {
        if (log.address && getAddress(log.address) !== getAddress(filter.address)) {
          return false;
        }

        if (log.blockNumber < filter.fromBlock || log.blockNumber > filter.toBlock) {
          return false;
        }

        return filter.topics.every((topic, index) => topicMatches(topic, log.topics[index]));
      });
    },
  };
}

function createTransaction(
  overrides: Partial<VerificationTransaction> = {},
): VerificationTransaction {
  return {
    data: encodeExecute(transferSelector),
    value: 0n,
    to: manager,
    from: l1Address,
    blockNumber: 15,
    ...overrides,
  };
}

function createRegisteredLog(
  blockNumber: number,
  logIndex: number,
  registeredL1Address: string,
  l2Address: string,
): VerificationLog {
  const event = bridgeInterface.getEvent("ChannelTokenVaultIdentityRegistered");
  const encoded = bridgeInterface.encodeEventLog(event!, [
    registeredL1Address,
    l2Address,
    0,
    0,
    0,
    0,
    0,
    false,
  ]);

  return {
    address: manager,
    topics: encoded.topics,
    data: encoded.data,
    blockNumber,
    transactionIndex: 0,
    index: logIndex,
  };
}

function createExitedLog(
  blockNumber: number,
  logIndex: number,
  exitedL1Address: string,
): VerificationLog {
  const event = bridgeInterface.getEvent("ChannelTokenVaultIdentityExited");
  const encoded = bridgeInterface.encodeEventLog(event!, [exitedL1Address, 0]);

  return {
    address: manager,
    topics: encoded.topics,
    data: encoded.data,
    blockNumber,
    transactionIndex: 0,
    index: logIndex,
  };
}

function encodeExecute(selector: string): string {
  return bridgeInterface.encodeFunctionData("executeChannelTransaction", [
    { data: "0x" },
    { functionSig: selector },
  ]);
}

function topicMatches(
  expected: string | string[] | null,
  actual: string | undefined,
): boolean {
  if (expected === null) {
    return true;
  }

  if (Array.isArray(expected)) {
    return actual !== undefined && expected.includes(actual);
  }

  return actual === expected;
}

function assertInvalidReason(
  result: Awaited<ReturnType<typeof verifySubmittedTransaction>>,
  reason: string,
): void {
  assert.equal(result.valid, false);

  if (!result.valid) {
    assert.equal(result.reason, reason);
  }
}
