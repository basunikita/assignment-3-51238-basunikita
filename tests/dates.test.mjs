import assert from "node:assert/strict";
import test from "node:test";
import { addDays, formatDayShort, formatLong, formatShort, parseDateKey, toDateKey, weekStart } from "../lib/dates.ts";

// Run under another time zone too: TZ=Pacific/Auckland node --test tests/dates.test.mjs
test("date keys use the local calendar day, not UTC", () => {
  assert.equal(toDateKey(new Date(2026, 9, 18, 23, 59)), "2026-10-18");
  assert.equal(toDateKey(new Date(2026, 9, 19, 0, 1)), "2026-10-19");
  assert.equal(toDateKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("parseDateKey accepts real dates and rejects everything else", () => {
  assert.equal(parseDateKey("2026-02-30"), null);
  assert.equal(parseDateKey("2026-13-01"), null);
  assert.equal(parseDateKey("hello"), null);
  assert.equal(parseDateKey("2026-10-1"), null);
  const date = parseDateKey("2026-10-16");
  assert.ok(date);
  assert.equal(toDateKey(date), "2026-10-16");
});

test("weeks start on Monday", () => {
  assert.equal(weekStart("2026-10-18"), "2026-10-12"); // Sunday → the Monday before
  assert.equal(weekStart("2026-10-12"), "2026-10-12");
  assert.equal(weekStart("2026-10-14"), "2026-10-12");
});

test("addDays crosses months and years", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
  assert.equal(addDays("2026-10-18", -7), "2026-10-11");
});

test("dates read the way the pages show them", () => {
  assert.equal(formatShort("2026-10-14"), "Oct 14");
  // 2026-10-15 is a Thursday (the spec's "Thu, Oct 16" example had the weekday wrong).
  assert.equal(formatDayShort("2026-10-15"), "Thu, Oct 15");
  assert.equal(formatLong("2026-10-15"), "Thursday, October 15");
  assert.equal(formatLong("2026-10-18"), "Sunday, October 18");
});

test("a month grid starts on Monday with blanks before the 1st", async () => {
  const { monthGrid } = await import("../lib/dates.ts");
  const october = monthGrid("2026-10"); // October 1, 2026 is a Thursday
  assert.deepEqual(october.slice(0, 4), [null, null, null, "2026-10-01"]);
  assert.equal(october.filter(Boolean).length, 31);
  assert.equal(october.filter(Boolean).at(-1), "2026-10-31");
  assert.equal(october.length % 7, 0); // padded to whole weeks
  const june = monthGrid("2026-06"); // June 1, 2026 is a Monday
  assert.equal(june[0], "2026-06-01");
});

test("months step and read as names", async () => {
  const { addMonths, formatMonth, monthOf } = await import("../lib/dates.ts");
  assert.equal(addMonths("2026-10", 1), "2026-11");
  assert.equal(addMonths("2026-01", -1), "2025-12");
  assert.equal(formatMonth("2026-10"), "October 2026");
  assert.equal(monthOf("2026-10-18"), "2026-10");
});
