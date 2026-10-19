import assert from "node:assert/strict";
import test from "node:test";
import { addDays, weekStart } from "../lib/dates.ts";
import { createSampleStore } from "../lib/sample.ts";
import { lastSession, maxWeightSeries, sessionsFor, streakWeeks, suggestedWeight } from "../lib/stats.ts";
import { parseStore } from "../lib/storage.ts";
import { countsAsWorkout } from "../lib/workouts.ts";
import { newId } from "./helpers.mjs";

const TODAY = "2026-10-18"; // a Sunday
const sample = createSampleStore(TODAY, newId);

test("the sample is a valid store with no workout today or later", () => {
  assert.ok(parseStore(JSON.stringify(sample)));
  assert.ok(sample.workouts.length > 0);
  assert.ok(sample.workouts.every((workout) => workout.date < weekStart(TODAY)));
});

test("every sample workout counts", () => {
  assert.ok(sample.workouts.every(countsAsWorkout));
});

test("the sample shows a suggestion, a chart and a streak", () => {
  assert.ok(suggestedWeight(lastSession(sample, "lat-pulldowns", TODAY)) > 0);
  assert.ok(maxWeightSeries(sample, "lat-pulldowns").length >= 3);
  assert.equal(streakWeeks(sample, TODAY), 2);
});

test("there is a missed week before the last two", () => {
  const weeks = new Set(sample.workouts.map((workout) => weekStart(workout.date)));
  const lastWeek = addDays(weekStart(TODAY), -7);
  assert.ok(weeks.has(lastWeek));
  assert.ok(weeks.has(addDays(lastWeek, -7)));
  assert.ok(!weeks.has(addDays(lastWeek, -14)));
  assert.ok(weeks.has(addDays(lastWeek, -21)));
});

test("weights climb, with one session that missed reps", () => {
  const series = maxWeightSeries(sample, "lat-pulldowns").map((point) => point.max);
  assert.ok(series.at(-1) > series[0]);
  const missed = sample.workouts.some((workout) => workout.entries.some((entry) => entry.sets.some((set) => set.reps < 10)));
  assert.ok(missed);
});

test("bodyweight exercises are logged at 0", () => {
  const sessions = sessionsFor(sample, "lower-back-hyperextensions");
  assert.ok(sessions.length > 0);
  assert.ok(sessions.every((session) => session.max === 0));
});

test("cardio days use the four options", () => {
  const cardio = sample.workouts.filter((workout) => workout.dayId === "cardio");
  assert.ok(cardio.length >= 3);
  assert.ok(cardio.every((workout) => ["run", "intervals", "incline", "stairs"].includes(workout.cardio.optionId)));
});
