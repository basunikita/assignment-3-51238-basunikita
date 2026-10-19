import assert from "node:assert/strict";
import test from "node:test";
import { createSeed } from "../lib/seed.ts";
import { checkExerciseForm, checkReps, checkWeight, MESSAGES, parseNumber, safeReturnTo } from "../lib/validation.ts";

test("messages say what to do next", () => {
  assert.equal(MESSAGES.repsEmpty, "Enter how many reps you did.");
  assert.equal(MESSAGES.repsRange, "Enter reps as a whole number from 1 to 100.");
  assert.equal(MESSAGES.weightEmpty, "Enter the weight you lifted, in lb.");
  assert.equal(MESSAGES.weightRange, "Enter a weight of 0 or more (0 for bodyweight).");
  assert.equal(MESSAGES.weightMax, "Enter a weight under 1,000 lb.");
  assert.equal("minutes" in MESSAGES, false); // cardio has no minutes field (review round 1)
  assert.equal(MESSAGES.cardioOption, "Choose which cardio you did.");
  assert.equal(MESSAGES.finishEmpty, "Tick at least one set before finishing.");
  assert.equal(MESSAGES.nameEmpty, "Enter a name for the exercise.");
  assert.equal(MESSAGES.nameLong, "Keep the name under 60 characters.");
  assert.equal(MESSAGES.nameTaken("Face pulls"), "You already have an exercise called Face pulls.");
  assert.equal(MESSAGES.dayMissing, "Choose which day it belongs to.");
});

test("parseNumber reads what people type", () => {
  assert.equal(parseNumber(" 50 "), 50);
  assert.equal(parseNumber("52,5"), 52.5);
  assert.equal(parseNumber("050"), 50);
  assert.equal(parseNumber(""), null);
  assert.equal(parseNumber("5o"), null);
  assert.equal(parseNumber("1e3"), null);
  assert.equal(parseNumber("."), null);
});

test("weights people actually type", () => {
  assert.deepEqual(checkWeight("52.5"), { value: 52.5, error: null });
  assert.equal(checkWeight(" 50 ").value, 50);
  assert.equal(checkWeight("52,5").value, 52.5);
  assert.equal(checkWeight("050").value, 50);
  assert.equal(checkWeight("0").value, 0);
  assert.equal(checkWeight("999.5").value, 999.5);
  assert.deepEqual(checkWeight(""), { value: null, error: MESSAGES.weightEmpty });
  assert.equal(checkWeight("   ").error, MESSAGES.weightEmpty);
  assert.equal(checkWeight("5o").error, MESSAGES.weightRange);
  assert.equal(checkWeight("-5").error, MESSAGES.weightRange);
  assert.equal(checkWeight("50.25").error, MESSAGES.weightRange);
  assert.equal(checkWeight("1000").error, MESSAGES.weightMax);
});

test("reps are whole numbers from 1 to 100", () => {
  assert.deepEqual(checkReps("10"), { value: 10, error: null });
  assert.equal(checkReps(" 8 ").value, 8);
  assert.equal(checkReps("").error, MESSAGES.repsEmpty);
  for (const bad of ["0", "101", "8.5", "x", "-3"]) assert.equal(checkReps(bad).error, MESSAGES.repsRange, bad);
});

test("the add-exercise form", () => {
  const store = createSeed();
  assert.deepEqual(checkExerciseForm(store, { name: "   ", dayId: null }), { name: MESSAGES.nameEmpty, day: MESSAGES.dayMissing });
  assert.equal(checkExerciseForm(store, { name: "face  pulls", dayId: "extra" }).name, "You already have an exercise called Face pulls.");
  assert.equal(checkExerciseForm(store, { name: "x".repeat(61), dayId: "legs" }).name, MESSAGES.nameLong);
  assert.deepEqual(checkExerciseForm(store, { name: "x".repeat(60), dayId: "legs" }), {});
  assert.deepEqual(checkExerciseForm(store, { name: "Leg press", dayId: "extra" }), {});
  assert.equal(checkExerciseForm(store, { name: "Leg press", dayId: "cardio" }).day, MESSAGES.dayMissing);
});

test("only in-app paths are allowed as a return address", () => {
  assert.equal(safeReturnTo("/workout/legs"), "/workout/legs");
  assert.equal(safeReturnTo("//evil.example"), null);
  assert.equal(safeReturnTo("https://evil.example"), null);
  assert.equal(safeReturnTo("/\\evil.example"), null);
  assert.equal(safeReturnTo(""), null);
  assert.equal(safeReturnTo(undefined), null);
});

test("return addresses with control characters can't leave the app (final review #4)", () => {
  assert.equal(safeReturnTo("/\t/evil.example"), null);
  assert.equal(safeReturnTo("/\n/evil.example"), null);
  assert.equal(safeReturnTo("/\r/evil.example"), null);
  assert.equal(safeReturnTo("/workout/legs?x=1"), "/workout/legs?x=1");
});
