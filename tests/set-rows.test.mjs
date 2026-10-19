import assert from "node:assert/strict";
import test from "node:test";
import { addRow, draftsFrom, tickRow, toSetRow } from "../lib/set-rows.ts";
import { rows } from "./helpers.mjs";

const last = { date: "2026-10-14", sets: rows([10, 50, true], [10, 55, true], [10, 60, true]), max: 60 };

test("a ticked row with a typo keeps its last saved numbers (final review #1)", () => {
  const ticked = tickRow({ reps: "10", weight: "50", done: false });
  assert.deepEqual(toSetRow(ticked), { reps: 10, weight: 50, done: true });
  assert.deepEqual(toSetRow({ ...ticked, weight: "" }), { reps: 10, weight: 50, done: true });
  assert.deepEqual(toSetRow({ ...ticked, weight: "5o" }), { reps: 10, weight: 50, done: true });
});

test("a valid edit to a ticked row saves the new numbers", () => {
  const ticked = tickRow({ reps: "10", weight: "50", done: false });
  assert.deepEqual(toSetRow({ ...ticked, weight: "52,5" }), { reps: 10, weight: 52.5, done: true });
});

test("an unticked row with a typo saves as empty, not ticked", () => {
  assert.deepEqual(toSetRow({ reps: "10", weight: "5o", done: false }), { reps: 10, weight: null, done: false });
});

test("ticking normalizes what was typed and remembers it", () => {
  assert.deepEqual(tickRow({ reps: " 8 ", weight: "52,5", done: false }), { reps: "8", weight: "52.5", done: true, saved: { reps: 8, weight: 52.5 } });
});

test("rows start from today's saved rows, or from last time when there are none (final review #2)", () => {
  const today = rows([10, 65, true], [10, 70, false]);
  assert.deepEqual(draftsFrom(today, last), [
    { reps: "10", weight: "65", done: true, saved: { reps: 10, weight: 65 } },
    { reps: "10", weight: "70", done: false },
  ]);
  assert.deepEqual(draftsFrom([], last).map((row) => row.weight), ["50", "55", "60"]);
  assert.deepEqual(draftsFrom(undefined, null).map((row) => [row.reps, row.weight]), [["10", ""], ["10", ""], ["10", ""]]);
});

test("adding a set copies the row above, or starts a fresh row when there are none", () => {
  assert.deepEqual(addRow([{ reps: "8", weight: "55", done: true, saved: { reps: 8, weight: 55 } }]).at(-1), { reps: "8", weight: "55", done: false });
  assert.deepEqual(addRow([]), [{ reps: "10", weight: "", done: false }]);
});
