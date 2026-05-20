export type RewardNote = {
  id: string;
  valueTon: number;
};

export type NoteSelection = {
  noteIds: string[];
  recipients: string[];
  amounts: string[];
};

type NoteRecord = Record<string, unknown>;

const noteIdKeys = ["id", "noteId", "noteID", "commitment", "commitmentHex"];
const noteValueKeys = [
  "value",
  "amount",
  "amountTon",
  "tokenAmount",
  "ton",
  "valueTokens",
  "amountTokens",
];

export function parseUnusedRewardNotes(output: unknown): RewardNote[] {
  const unusedNotes = findArrayByKey(output, "unusedNotes");

  if (!unusedNotes) {
    throw new Error("wallet get-notes output did not include unusedNotes.");
  }

  const notes = unusedNotes.map(parseRewardNote);

  if (notes.some((note) => note.valueTon <= 0)) {
    throw new Error("wallet get-notes output included an invalid note value.");
  }

  return notes;
}

export function sumRewardNotes(notes: RewardNote[]): number {
  return notes.reduce((sum, note) => sum + note.valueTon, 0);
}

export function selectRewardNotes(
  notes: RewardNote[],
  rewardTon: number,
  recipientL2Address: string,
  rewardWalletL2Address: string,
): NoteSelection {
  const sorted = [...notes].sort((left, right) => left.valueTon - right.valueTon);
  const exact = sorted.find((note) => note.valueTon === rewardTon);

  if (exact) {
    return {
      noteIds: [exact.id],
      recipients: [recipientL2Address],
      amounts: [formatTon(rewardTon)],
    };
  }

  const larger = sorted.find((note) => note.valueTon > rewardTon);

  if (larger) {
    return {
      noteIds: [larger.id],
      recipients: [recipientL2Address, rewardWalletL2Address],
      amounts: [formatTon(rewardTon), formatTon(larger.valueTon - rewardTon)],
    };
  }

  const exactPair = findSmallestPair(sorted, rewardTon, false);

  if (exactPair) {
    return {
      noteIds: exactPair.map((note) => note.id),
      recipients: [recipientL2Address],
      amounts: [formatTon(rewardTon)],
    };
  }

  const overpayingPair = findSmallestPair(sorted, rewardTon, true);

  if (overpayingPair) {
    throw new Error(
      "Reward wallet only has a two-note overpaying selection. The current CLI supports 1->1, 1->2, and 2->1 transfers, so this payout cannot preserve change safely.",
    );
  }

  throw new Error("Reward wallet has no supported note selection for this payout.");
}

function parseRewardNote(value: unknown): RewardNote {
  if (!value || typeof value !== "object") {
    throw new Error("wallet get-notes output included a non-object note.");
  }

  const record = value as NoteRecord;
  const id = findFirstString(record, noteIdKeys);
  const noteValue = findFirstValue(record, noteValueKeys);
  const valueTon = parseTon(noteValue);

  if (!id) {
    throw new Error("wallet get-notes output included a note without an id.");
  }

  if (valueTon === null) {
    throw new Error(`wallet get-notes output included note ${id} without a readable TON value.`);
  }

  return {
    id,
    valueTon,
  };
}

function findArrayByKey(value: unknown, targetKey: string): unknown[] | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findArrayByKey(item, targetKey);

      if (found) {
        return found;
      }
    }

    return null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const candidate = record[targetKey];

  if (Array.isArray(candidate)) {
    return candidate;
  }

  for (const item of Object.values(record)) {
    const found = findArrayByKey(item, targetKey);

    if (found) {
      return found;
    }
  }

  return null;
}

function findFirstString(record: NoteRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

function findFirstValue(record: NoteRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined) {
      return record[key];
    }
  }

  return undefined;
}

function parseTon(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }

  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*TON$/i);

  if (match) {
    return Number(match[1]);
  }

  return null;
}

function findSmallestPair(
  sorted: RewardNote[],
  rewardTon: number,
  allowOverpay: boolean,
): [RewardNote, RewardNote] | null {
  let best: [RewardNote, RewardNote] | null = null;
  let bestSum = Number.POSITIVE_INFINITY;

  for (let leftIndex = 0; leftIndex < sorted.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < sorted.length;
      rightIndex += 1
    ) {
      const left = sorted[leftIndex];
      const right = sorted[rightIndex];
      const sum = left.valueTon + right.valueTon;
      const accepted = allowOverpay ? sum > rewardTon : sum === rewardTon;

      if (accepted && sum < bestSum) {
        best = [left, right];
        bestSum = sum;
      }
    }
  }

  return best;
}

function formatTon(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}
