import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTransferNotesArgs,
  findTransactionHash,
} from "@/lib/private-state-cli";

test("buildTransferNotesArgs serializes note ids as a JSON array", () => {
  const args = buildTransferNotesArgs(
    { network: "mainnet", rewardAccount: "account2" },
    "the-great-first-channel-0x85cc7da8Ee323325bcD678C7CFc4EB61e76657Fb",
    [
      "0x60e797d6d277a97422b9635ab94a44efd6c187b2124029da3174d29a12b36993",
    ],
    [
      "0x5A558ebDCA4eFd7da8eAD3cD7e2C6e14F9721171",
      "0x5A558ebDCA4eFd7da8eAD3cD7e2C6e14F9721171",
    ],
    ["25", "50"],
  );

  assert.equal(args[args.indexOf("--note-ids") + 1], JSON.stringify([
    "0x60e797d6d277a97422b9635ab94a44efd6c187b2124029da3174d29a12b36993",
  ]));
  assert.equal(
    args[args.indexOf("--recipients") + 1],
    JSON.stringify([
      "0x5A558ebDCA4eFd7da8eAD3cD7e2C6e14F9721171",
      "0x5A558ebDCA4eFd7da8eAD3cD7e2C6e14F9721171",
    ]),
  );
  assert.equal(args[args.indexOf("--amounts") + 1], JSON.stringify(["25", "50"]));
  assert.equal(args[args.indexOf("--tx-submitter") + 1], "account2");
});

test("findTransactionHash reads the transfer tx hash from CLI output notes", () => {
  assert.equal(
    findTransactionHash({
      action: "wallet transfer-notes",
      outputNotes: [
        {
          commitment: `0x${"1".repeat(64)}`,
          sourceTxHash: `0x${"2".repeat(64)}`,
        },
      ],
    }),
    `0x${"2".repeat(64)}`,
  );
});
