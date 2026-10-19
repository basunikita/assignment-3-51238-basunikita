import assert from "node:assert/strict";
import test from "node:test";
import { createSeed } from "../lib/seed.ts";
import {
  bestWeight,
  chartSummary,
  exerciseProgress,
  formatSets,
  lastSession,
  maxWeightSeries,
  newBest,
  prefillRows,
  sessionsFor,
  streakWeeks,
  suggestedWeight,
  weekStrip,
  workoutSummary,
} from "../lib/stats.ts";
import { rows } from "./helpers.mjs";

// 2026-10-18 is a Sunday; its week runs Monday 2026-10-12 to Sunday 2026-10-18.
const TODAY = "2026-10-18";
let n = 0;
const strength = (date, dayId, entries) => ({ id: `w${++n}`, date, dayId, entries });
const entry = (exerciseId, ...sets) => ({ exerciseId, sets: rows(...sets) });
const cardio = (date, optionId, minutes) => ({ id: `w${++n}`, date, dayId: "cardio", entries: [], cardio: { optionId, minutes } });
const withWorkouts = (workouts) => ({ ...createSeed(), workouts });

const history = withWorkouts([
  strength("2026-10-11", "back-biceps", [entry("lat-pulldowns", [10, 45, true], [10, 45, true], [10, 45, true])]),
  strength("2026-10-14", "back-biceps", [entry("lat-pulldowns", [10, 50, true], [10, 50, true], [10, 50, true], [10, 60, false])]),
  strength("2026-10-14", "legs", [entry("lat-pulldowns", [10, 52.5, true])]),
  strength(TODAY, "back-biceps", [entry("lat-pulldowns", [10, 55, true])]),
]);

test("sessions merge every workout on a date and keep only logged sets", () => {
  const sessions = sessionsFor(history, "lat-pulldowns");
  assert.deepEqual(sessions.map((s) => [s.date, s.max, s.sets.length]), [
    ["2026-10-11", 45, 3],
    ["2026-10-14", 52.5, 4],
    [TODAY, 55, 1],
  ]);
});

test("last session is the latest date before today", () => {
  assert.equal(lastSession(history, "lat-pulldowns", TODAY)?.date, "2026-10-14");
  assert.equal(lastSession(history, "face-pulls", TODAY), null);
  const onlyUnticked = withWorkouts([strength("2026-10-14", "back-biceps", [entry("face-pulls", [10, 20, false])])]);
  assert.equal(lastSession(onlyUnticked, "face-pulls", TODAY), null);
});

test("best weight, optionally only before a date", () => {
  assert.equal(bestWeight(history, "lat-pulldowns"), 55);
  assert.equal(bestWeight(history, "lat-pulldowns", TODAY), 52.5);
  assert.equal(bestWeight(history, "face-pulls"), null);
});

test("suggestion: +5 when every set hit 10 reps, otherwise the same weight", () => {
  assert.equal(suggestedWeight({ date: "2026-10-14", sets: rows([10, 50, true], [10, 50, true], [10, 50, true]), max: 50 }), 55);
  assert.equal(suggestedWeight({ date: "2026-10-14", sets: rows([10, 50, true], [8, 50, true]), max: 50 }), 50);
  assert.equal(suggestedWeight({ date: "2026-10-14", sets: rows([10, 0, true]), max: 0 }), null);
  assert.equal(suggestedWeight(null), null);
});

test("a new best compares with earlier dates only", () => {
  const store = withWorkouts([strength("2026-10-14", "back-biceps", [entry("lat-pulldowns", [10, 50, true])])]);
  assert.deepEqual(newBest(store, "lat-pulldowns", TODAY, 55), { previous: 50 });
  assert.equal(newBest(store, "lat-pulldowns", TODAY, 50), null);
  assert.equal(newBest(store, "face-pulls", TODAY, 20), null); // first ever log
  const sameDay = withWorkouts([strength(TODAY, "back-biceps", [entry("lat-pulldowns", [10, 60, true])])]);
  assert.equal(newBest(sameDay, "lat-pulldowns", TODAY, 55), null);
});

test("the chart series is one max per date", () => {
  assert.deepEqual(maxWeightSeries(history, "lat-pulldowns"), [
    { date: "2026-10-11", max: 45 },
    { date: "2026-10-14", max: 52.5 },
    { date: TODAY, max: 55 },
  ]);
});

test("the chart summary reads as a sentence", () => {
  assert.equal(
    chartSummary("Lat pulldowns", [{ date: "2026-10-14", max: 50 }, { date: TODAY, max: 55 }]),
    "Max weight for Lat pulldowns went from 50 lb on Oct 14 to 55 lb on Oct 18, over 2 sessions.",
  );
  assert.equal(chartSummary("Lat pulldowns", [{ date: "2026-10-14", max: 50 }]), "Max weight for Lat pulldowns: 50 lb on Oct 14, 1 session.");
  assert.equal(chartSummary("Lat pulldowns", []), "No sets logged yet for Lat pulldowns.");
});

test("formatSets", () => {
  assert.equal(formatSets(rows([10, 50, true], [10, 50, true], [10, 50, true])), "3 × 10 @ 50 lb");
  assert.equal(formatSets(rows([10, 50, true], [10, 50, true], [8, 50, true])), "10, 10, 8 @ 50 lb");
  assert.equal(formatSets(rows([10, 50, true], [10, 55, true])), "10 @ 50 lb, 10 @ 55 lb");
  assert.equal(formatSets(rows([10, 0, true], [10, 0, true], [10, 0, true])), "3 × 10 · bodyweight");
  assert.equal(formatSets(rows([10, 52.5, true])), "1 × 10 @ 52.5 lb");
});

test("prefill: last time's sets by position, at least three rows, nothing ticked", () => {
  assert.deepEqual(prefillRows(null), rows([10, null, false], [10, null, false], [10, null, false]));
  const last = { date: "2026-10-14", sets: rows([10, 50, true], [8, 55, true]), max: 55 };
  assert.deepEqual(prefillRows(last), rows([10, 50, false], [8, 55, false], [8, 55, false]));
  const four = { date: "2026-10-14", sets: rows([10, 50, true], [10, 50, true], [10, 50, true], [6, 50, true]), max: 50 };
  assert.equal(prefillRows(four).length, 4);
});

test("progress counts ticked rows out of all rows", () => {
  const workout = strength(TODAY, "back-biceps", [entry("lat-pulldowns", [10, 50, true], [10, 50, false], [10, 50, false], [10, 50, false])]);
  assert.deepEqual(exerciseProgress(workout, "lat-pulldowns"), { done: 1, total: 4 });
  assert.deepEqual(exerciseProgress(workout, "face-pulls"), { done: 0, total: 0 });
  assert.deepEqual(exerciseProgress(undefined, "lat-pulldowns"), { done: 0, total: 0 });
});

test("workout summaries", () => {
  const store = createSeed();
  const big = strength(TODAY, "back-biceps", [
    entry("lat-pulldowns", [10, 50, true], [10, 50, true]),
    entry("face-pulls", [10, 20, true]),
    entry("barbell-curls", [10, 30, false]),
  ]);
  assert.equal(workoutSummary(store, big), "2 exercises, 3 sets");
  assert.equal(workoutSummary(store, strength(TODAY, "legs", [entry("rdls", [10, 60, true])])), "1 exercise, 1 set");
  assert.equal(workoutSummary(store, cardio(TODAY, "incline", 30)), "Incline walk, 30 min");
});

test("the week strip runs Monday to Sunday with tones and names", () => {
  const store = withWorkouts([
    strength("2026-10-12", "back-biceps", [entry("lat-pulldowns", [10, 50, true])]),
    strength("2026-10-15", "legs", [entry("rdls", [10, 60, true])]),
    cardio("2026-10-15", "incline", 30),
    strength("2026-10-16", "legs", [entry("rdls", [10, 60, false])]), // nothing ticked: doesn't count
  ]);
  const strip = weekStrip(store, "2026-10-16");
  assert.deepEqual(strip.map((d) => d.date), ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"]);
  assert.deepEqual(strip.map((d) => d.letter), ["M", "T", "W", "T", "F", "S", "S"]);
  assert.deepEqual(strip[0].tones, ["upper"]);
  assert.deepEqual(strip[3].tones, ["legs", "cardio"]);
  assert.deepEqual(strip[4].tones, []);
  assert.equal(strip[3].label, "Thursday, October 15: Legs and Cardio");
  assert.equal(strip[0].label, "Monday, October 12: Back and biceps");
  assert.equal(strip[4].label, "Friday, October 16: nothing logged");
  assert.equal(strip[4].isToday, true);
  assert.deepEqual(strip.map((d) => d.isFuture), [false, false, false, false, false, true, true]);
  assert.equal(strip[3].dayNumber, 15);
});

test("the streak counts weeks back from this one, or from last week if this one is empty", () => {
  const store = withWorkouts([
    strength("2026-10-07", "legs", [entry("rdls", [10, 60, true])]), // week of Oct 5
    cardio("2026-10-13", "incline", 30), // week of Oct 12
  ]);
  assert.equal(streakWeeks(store, TODAY), 2);
  assert.equal(streakWeeks(store, "2026-10-20"), 2); // new week, nothing yet: still 2
  assert.equal(streakWeeks(store, "2026-10-27"), 0); // a whole week missed
  assert.equal(streakWeeks(createSeed(), TODAY), 0);
});

test("a gap week breaks the streak", () => {
  const store = withWorkouts([
    strength("2026-09-30", "legs", [entry("rdls", [10, 60, true])]), // week of Sep 28
    strength("2026-10-14", "legs", [entry("rdls", [10, 60, true])]), // week of Oct 12; Oct 5 missed
  ]);
  assert.equal(streakWeeks(store, TODAY), 1);
});

test("the last-time line on a workout's exercise rows", async () => {
  const { lastTimeLine } = await import("../lib/stats.ts");
  assert.equal(lastTimeLine(null), "Not logged yet");
  assert.equal(lastTimeLine({ date: "2026-10-14", sets: rows([10, 50, true], [10, 50, true], [10, 50, true]), max: 50 }), "Last 3 × 10 @ 50 lb · try 55");
  assert.equal(lastTimeLine({ date: "2026-10-14", sets: rows([10, 50, true], [8, 50, true]), max: 50 }), "Last 10, 8 @ 50 lb · try 50");
  assert.equal(lastTimeLine({ date: "2026-10-14", sets: rows([10, 0, true], [10, 0, true], [10, 0, true]), max: 0 }), "Last 3 × 10 · bodyweight");
});

test("new bests in a workout compare each exercise's heaviest set with earlier dates", async () => {
  const { newBestCount } = await import("../lib/stats.ts");
  const today = strength(TODAY, "back-biceps", [
    entry("lat-pulldowns", [10, 55, true], [10, 50, true]), // beats 52.5
    entry("face-pulls", [10, 20, true]), // first time: not a "new best"
    entry("barbell-curls", [10, 99, false]), // not ticked
  ]);
  const store = { ...history, workouts: [...history.workouts.filter((w) => w.date !== TODAY), today] };
  assert.equal(newBestCount(store, today), 1);
});
