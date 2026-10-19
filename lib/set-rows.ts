import { TARGET_REPS } from "./routine.ts";
import { prefillRows, type Session } from "./stats.ts";
import type { SetRow } from "./types.ts";
import { checkReps, checkWeight } from "./validation.ts";

// A set row as typed on the logging page. `saved` holds a ticked row's last valid numbers, so a
// typo in a ticked row never un-logs the set that was already saved.
export type RowDraft = { reps: string; weight: string; done: boolean; saved?: { reps: number; weight: number } };

const text = (value: number | null) => (value === null ? "" : String(value));

// Today's rows if there are any, otherwise last time's sets (or 3 × 10 the first time).
export function draftsFrom(todaysSets: SetRow[] | undefined, last: Session | null): RowDraft[] {
  const sets = todaysSets?.length ? todaysSets : prefillRows(last);
  return sets.map((set) => {
    const draft: RowDraft = { reps: text(set.reps), weight: text(set.weight), done: set.done };
    if (set.done && set.reps !== null && set.weight !== null) draft.saved = { reps: set.reps, weight: set.weight };
    return draft;
  });
}

// What gets stored for a row: its typed numbers when valid, else a ticked row's last saved numbers.
export function toSetRow(row: RowDraft): SetRow {
  const reps = checkReps(row.reps).value;
  const weight = checkWeight(row.weight).value;
  if (row.done && reps !== null && weight !== null) return { reps, weight, done: true };
  if (row.done && row.saved) return { ...row.saved, done: true };
  return { reps, weight, done: false };
}

// Ticks a row whose fields are valid (check them first), tidying what was typed ("52,5" → "52.5").
export function tickRow(row: RowDraft): RowDraft {
  const reps = checkReps(row.reps).value as number;
  const weight = checkWeight(row.weight).value as number;
  return { reps: String(reps), weight: String(weight), done: true, saved: { reps, weight } };
}

export function addRow(rows: RowDraft[]): RowDraft[] {
  const above = rows.at(-1);
  return [...rows, above ? { reps: above.reps, weight: above.weight, done: false } : { reps: String(TARGET_REPS), weight: "", done: false }];
}

// After a set is ticked, sets below it that haven't been touched and have no weight yet start
// at the same weight, so the first session doesn't mean typing it three times.
export function carryWeight(rows: RowDraft[], touched: boolean[], fromIndex: number): RowDraft[] {
  const weight = rows[fromIndex]?.weight;
  if (!weight) return rows;
  return rows.map((row, i) => (i > fromIndex && !touched[i] && !row.done && row.weight === "" ? { ...row, weight } : row));
}
