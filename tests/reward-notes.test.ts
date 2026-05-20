import assert from "node:assert/strict";
import test from "node:test";

import {
  parseUnusedRewardNotes,
  selectRewardNotes,
  sumRewardNotes,
} from "@/lib/reward-notes";

const recipient = "0x0000000000000000000000000000000000000001";
const changeRecipient = "0x0000000000000000000000000000000000000002";

test("parseUnusedRewardNotes reads note ids and TON values", () => {
  const notes = parseUnusedRewardNotes({
    unusedNotes: [
      { noteId: "note-1", value: "25 TON" },
      { id: "note-2", amountTon: "10" },
      { commitment: "note-3", valueTokens: "100.0" },
    ],
  });

  assert.deepEqual(notes, [
    { id: "note-1", valueTon: 25 },
    { id: "note-2", valueTon: 10 },
    { id: "note-3", valueTon: 100 },
  ]);
  assert.equal(sumRewardNotes(notes), 135);
});

test("selectRewardNotes prefers one exact 25 TON note", () => {
  const selection = selectRewardNotes(
    [
      { id: "large", valueTon: 50 },
      { id: "exact", valueTon: 25 },
    ],
    25,
    recipient,
    changeRecipient,
  );

  assert.deepEqual(selection, {
    noteIds: ["exact"],
    recipients: [recipient],
    amounts: ["25"],
  });
});

test("selectRewardNotes uses the smallest larger one-note input with change", () => {
  const selection = selectRewardNotes(
    [
      { id: "larger", valueTon: 40 },
      { id: "largest", valueTon: 100 },
    ],
    25,
    recipient,
    changeRecipient,
  );

  assert.deepEqual(selection, {
    noteIds: ["larger"],
    recipients: [recipient, changeRecipient],
    amounts: ["25", "15"],
  });
});

test("selectRewardNotes supports exact two-note sums", () => {
  const selection = selectRewardNotes(
    [
      { id: "ten", valueTon: 10 },
      { id: "fifteen", valueTon: 15 },
    ],
    25,
    recipient,
    changeRecipient,
  );

  assert.deepEqual(selection, {
    noteIds: ["ten", "fifteen"],
    recipients: [recipient],
    amounts: ["25"],
  });
});

test("selectRewardNotes rejects two-note overpaying selections", () => {
  assert.throws(
    () =>
      selectRewardNotes(
        [
          { id: "ten", valueTon: 10 },
          { id: "twenty", valueTon: 20 },
        ],
        25,
        recipient,
        changeRecipient,
      ),
    /two-note overpaying selection/,
  );
});
