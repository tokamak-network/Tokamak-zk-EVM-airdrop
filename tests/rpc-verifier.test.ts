import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { getAddress, Interface } from "ethers";

import type { AppConfig } from "@/lib/config";
import {
  verifySubmittedTransaction,
  type VerificationBlock,
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
const eligibleStartTimestamp = Date.UTC(2026, 4, 19, 0, 0, 0) / 1000;

const bridgeInterface = new Interface([
  "function executeChannelTransaction((bytes data) payload,(bytes4 functionSig) functionProof)",
  "function getChannelTokenVaultRegistration(address l1Address) view returns ((bool exists,address l2Address,bytes32 channelTokenVaultKey,uint256 leafIndex,uint256 joinTollPaid,uint64 joinedAt,(bytes32 x,uint8 yParity) noteReceivePubKey,bool isZeroBalance))",
  "function otherFunction()",
]);
const currentBridgeInterface = new Interface([
  "function executeChannelTransaction((uint128[],uint256[],uint128[],uint256[],uint256[],uint256[]),((address,bytes4,bytes32,(uint8,uint8,uint8,uint8,(uint16,uint8)[])),bytes32[]))",
  "function getChannelTokenVaultRegistration(address l1Address) view returns ((bool exists,address l2Address,bytes32 channelTokenVaultKey,uint256 leafIndex,uint256 joinTollPaid,uint64 joinedAt,(bytes32 x,uint8 yParity) noteReceivePubKey,bool isZeroBalance))",
]);
const misleadingBridgeInterface = new Interface([
  "function executeChannelTransaction((bytes4 selector) payload,(bytes32 proofRoot) functionProof)",
  "function getChannelTokenVaultRegistration(address l1Address) view returns ((bool exists,address l2Address,bytes32 channelTokenVaultKey,uint256 leafIndex,uint256 joinTollPaid,uint64 joinedAt,(bytes32 x,uint8 yParity) noteReceivePubKey,bool isZeroBalance))",
]);
const privateStateInterface = new Interface([
  "function mintNotes1()",
  "function transferNotes1To1()",
]);

test("verifySubmittedTransaction accepts a transferNotes tx and resolves the current registered Tonnel channel address", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({
          blockNumber: 40,
          data: encodeExecute(transferSelector),
        }),
        registrationL2Address: secondL2Address,
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

test("verifySubmittedTransaction reads current registration with eth_call instead of getLogs", async () => {
  let callCount = 0;
  const provider = createProvider({
    transaction: createTransaction({
      blockNumber: 40,
      data: encodeExecute(transferSelector),
    }),
    onCall: () => {
      callCount += 1;
    },
  });
  const result = await verifySubmittedTransaction(createConfig(), txHash, {
    provider,
    channelManagerInterface: bridgeInterface,
    transferSelectors: new Set([transferSelector]),
  });

  assert.equal(result.valid, true);
  assert.equal(callCount, 1);
});

test("verifySubmittedTransaction skips stale ABI candidates and decodes with the matching channel manager ABI", async () => {
  const artifactDir = mkdtempSync(path.join(tmpdir(), "tonnel-abi-test-"));

  try {
    writeFileSync(
      path.join(artifactDir, "bridge-abi-manifest.json"),
      JSON.stringify([
        JSON.parse(bridgeInterface.formatJson()),
        JSON.parse(currentBridgeInterface.formatJson()),
      ]),
    );

    const result = await verifySubmittedTransaction(
      createConfig({ cliArtifactDir: artifactDir }),
      txHash,
      {
        provider: createProvider({
          transaction: createTransaction({
            blockNumber: 40,
            data: encodeCurrentExecute(transferSelector),
          }),
        }),
        transferSelectors: new Set([transferSelector]),
      },
    );

    assert.deepEqual(result, {
      valid: true,
      resolvedL1Address: l1Address,
      resolvedL2Address: firstL2Address,
    });
  } finally {
    rmSync(artifactDir, { recursive: true, force: true });
  }
});

test("verifySubmittedTransaction loads transfer selectors from explicit transferNotes ABI functions only", async () => {
  const transferFunction = privateStateInterface.getFunction("transferNotes1To1");
  const artifactDir = mkdtempSync(path.join(tmpdir(), "tonnel-selector-test-"));

  try {
    writeFileSync(
      path.join(artifactDir, "bridge-abi.json"),
      JSON.stringify(JSON.parse(bridgeInterface.formatJson())),
    );
    writeFileSync(
      path.join(artifactDir, "private-state-abi.json"),
      JSON.stringify(JSON.parse(privateStateInterface.formatJson())),
    );

    const result = await verifySubmittedTransaction(
      createConfig({ cliArtifactDir: artifactDir }),
      txHash,
      {
        provider: createProvider({
          transaction: createTransaction({
            blockNumber: 40,
            data: encodeExecute(transferFunction!.selector),
          }),
        }),
      },
    );

    assert.deepEqual(result, {
      valid: true,
      resolvedL1Address: l1Address,
      resolvedL2Address: firstL2Address,
    });
  } finally {
    rmSync(artifactDir, { recursive: true, force: true });
  }
});

test("verifySubmittedTransaction rejects selectors hidden outside functionProof metadata", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({
          data: misleadingBridgeInterface.encodeFunctionData(
            "executeChannelTransaction",
            [
              { selector: transferSelector },
              { proofRoot: `0x${"0".repeat(64)}` },
            ],
          ),
        }),
      }),
      channelManagerInterface: misleadingBridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(
    result,
    "Could not read private-state function selector from transaction metadata.",
  );
});

test("verifySubmittedTransaction rejects arbitrary selectors in non-ABI artifacts that mention transferNotes", async () => {
  const mintFunction = privateStateInterface.getFunction("mintNotes1");
  const artifactDir = mkdtempSync(path.join(tmpdir(), "tonnel-false-positive-test-"));

  try {
    writeFileSync(
      path.join(artifactDir, "bridge-abi.json"),
      JSON.stringify(JSON.parse(bridgeInterface.formatJson())),
    );
    writeFileSync(
      path.join(artifactDir, "private-state-abi.json"),
      JSON.stringify(JSON.parse(privateStateInterface.formatJson())),
    );
    writeFileSync(
      path.join(artifactDir, "misleading-selector.json"),
      JSON.stringify({
        label: "transferNotes",
        exampleName: "private-state/transferNotes/notAFunctionName",
        functionSig: mintFunction!.selector,
        selector: mintFunction!.selector,
      }),
    );

    const result = await verifySubmittedTransaction(
      createConfig({ cliArtifactDir: artifactDir }),
      txHash,
      {
        provider: createProvider({
          transaction: createTransaction({
            data: encodeExecute(mintFunction!.selector),
          }),
        }),
      },
    );

    assertInvalidReason(
      result,
      "Transaction is not a private-state transfer notes transaction.",
    );
  } finally {
    rmSync(artifactDir, { recursive: true, force: true });
  }
});

test("verifySubmittedTransaction rejects failed receipts", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({ data: encodeExecute(transferSelector) }),
        receipt: { status: 0 },
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(result, "Transaction did not succeed.");
});

test("verifySubmittedTransaction rejects transferNotes txs before the eligible start date", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({ data: encodeExecute(transferSelector) }),
        block: { timestamp: eligibleStartTimestamp - 1 },
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(result, "Transaction is outside the eligible event window.");
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
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(result, "Transaction is not a private-state transfer notes transaction.");
});

test("verifySubmittedTransaction rejects transferNotes txs when submitter is not currently registered", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({ data: encodeExecute(transferSelector) }),
        registrationExists: false,
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(
    result,
    "Transaction submitter is not currently registered in Tonnel.",
  );
});

test("verifySubmittedTransaction rejects transferNotes txs when current registration has no Tonnel channel address", async () => {
  const result = await verifySubmittedTransaction(
    createConfig(),
    txHash,
    {
      provider: createProvider({
        transaction: createTransaction({ data: encodeExecute(transferSelector) }),
        registrationL2Address: "0x0000000000000000000000000000000000000000",
      }),
      channelManagerInterface: bridgeInterface,
      transferSelectors: new Set([transferSelector]),
    },
  );

  assertInvalidReason(
    result,
    "Transaction submitter is not currently registered in Tonnel.",
  );
});

function createConfig(overrides: Partial<AppConfig> = {}): AppConfig {
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
    ...overrides,
  };
}

function createProvider(input: {
  transaction: VerificationTransaction | null;
  receipt?: VerificationReceipt | null;
  block?: VerificationBlock | null;
  registrationExists?: boolean;
  registrationL2Address?: string;
  onCall?: () => void;
}): VerificationProvider {
  return {
    async getTransaction() {
      return input.transaction;
    },
    async getTransactionReceipt() {
      return input.receipt === undefined ? { status: 1 } : input.receipt;
    },
    async getBlock() {
      return input.block === undefined
        ? { timestamp: eligibleStartTimestamp }
        : input.block;
    },
    async call() {
      input.onCall?.();
      return bridgeInterface.encodeFunctionResult(
        "getChannelTokenVaultRegistration",
        [
          [
            input.registrationExists ?? true,
            input.registrationL2Address ?? firstL2Address,
            `0x${"0".repeat(64)}`,
            0,
            0,
            0,
            [`0x${"0".repeat(64)}`, 0],
            false,
          ],
        ],
      );
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

function encodeExecute(selector: string): string {
  return bridgeInterface.encodeFunctionData("executeChannelTransaction", [
    { data: "0x" },
    { functionSig: selector },
  ]);
}

function encodeCurrentExecute(selector: string): string {
  return currentBridgeInterface.encodeFunctionData("executeChannelTransaction", [
    [[], [], [], [], [], []],
    [
      [
        "0x0000000000000000000000000000000000000000",
        selector,
        `0x${"0".repeat(64)}`,
        [0, 0, 0, 0, []],
      ],
      [],
    ],
  ]);
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
