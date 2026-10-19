import assert from "node:assert/strict";
import test from "node:test";
import { createSeed } from "../lib/seed.ts";
import {
  countsAsWorkout,
  deleteWorkout,
  findWorkout,
  finishWorkout,
  isLogged,
  restoreWorkout,
  saveCardio,
  saveEntry,
  updateCardio,
  updateSets,
  workoutsOn,
} from "../lib/workouts.ts";
import { newId, rows } from "./helpers.mjs";

const DAY = "2026-10-18";
const lat = (store, sets) => saveEntry(store, { date: DAY, dayId: "back-biceps", exerciseId: "lat-pulldowns", sets, newId });

function deepFreeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

test("typing before the first tick creates nothing", () => {
  const seed = createSeed();
  assert.equal(lat(seed, rows([10, 50, false], [10, null, false])), seed);
});

test("the first tick creates today's workout and later edits update it", () => {
  const ticked = lat(createSeed(), rows([10, 50, true], [10, 50, false], [10, 50, false]));
  assert.equal(ticked.workouts.length, 1);
  const workout = findWorkout(ticked, DAY, "back-biceps");
  assert.equal(workout.date, DAY);
  assert.deepEqual(workout.entries, [{ exerciseId: "lat-pulldowns", sets: rows([10, 50, true], [10, 50, false], [10, 50, false]) }]);

  // Once the workout exists, untouched rows are saved too (a 4th row added, nothing new ticked).
  const added = lat(ticked, rows([10, 50, true], [10, 50, false], [10, 50, false], [10, 50, false]));
  assert.equal(added.workouts.length, 1);
  assert.equal(findWorkout(added, DAY, "back-biceps").id, workout.id);
  assert.equal(findWorkout(added, DAY, "back-biceps").entries[0].sets.length, 4);
});

test("continue it: one workout per date and day, with an entry per exercise", () => {
  let store = lat(createSeed(), rows([10, 50, true]));
  store = saveEntry(store, { date: DAY, dayId: "back-biceps", exerciseId: "face-pulls", sets: rows([10, 20, true]), newId });
  assert.equal(store.workouts.length, 1);
  assert.deepEqual(findWorkout(store, DAY, "back-biceps").entries.map((e) => e.exerciseId), ["lat-pulldowns", "face-pulls"]);
  assert.equal(findWorkout(store, DAY, "legs"), undefined);
  assert.equal(findWorkout(store, "2026-10-19", "back-biceps"), undefined);
  assert.equal(workoutsOn(store, DAY).length, 1);
});

test("a logged set is ticked with real numbers; 0 lb is bodyweight", () => {
  assert.equal(isLogged({ reps: 10, weight: 50, done: true }), true);
  assert.equal(isLogged({ reps: 10, weight: 0, done: true }), true);
  assert.equal(isLogged({ reps: 10, weight: 50, done: false }), false);
  assert.equal(isLogged({ reps: null, weight: 50, done: true }), false);
  assert.equal(isLogged({ reps: 10, weight: null, done: true }), false);
});

test("a workout counts once it has a logged set or cardio", () => {
  const ticked = lat(createSeed(), rows([10, 0, true]));
  assert.equal(countsAsWorkout(findWorkout(ticked, DAY, "back-biceps")), true);
  const unticked = lat(ticked, rows([10, 0, false]));
  assert.equal(countsAsWorkout(findWorkout(unticked, DAY, "back-biceps")), false);
  const cardio = saveCardio(createSeed(), { date: DAY, optionId: "incline", newId, nowIso: "2026-10-18T10:00:00.000Z" });
  assert.equal(countsAsWorkout(findWorkout(cardio, DAY, "cardio")), true);
});

test("finishing records the time and keeps the workout editable", () => {
  const store = lat(createSeed(), rows([10, 50, true]));
  const id = findWorkout(store, DAY, "back-biceps").id;
  const finished = finishWorkout(store, id, "2026-10-18T10:00:00.000Z");
  assert.equal(findWorkout(finished, DAY, "back-biceps").finishedAt, "2026-10-18T10:00:00.000Z");
  const edited = lat(finished, rows([10, 55, true]));
  assert.equal(findWorkout(edited, DAY, "back-biceps").finishedAt, "2026-10-18T10:00:00.000Z");
});

test("saving cardio twice on a date updates one finished workout with the latest choice", () => {
  let store = saveCardio(createSeed(), { date: DAY, optionId: "incline", newId, nowIso: "2026-10-18T10:00:00.000Z" });
  store = saveCardio(store, { date: DAY, optionId: "stairs", newId, nowIso: "2026-10-18T11:00:00.000Z" });
  assert.equal(store.workouts.length, 1);
  const workout = findWorkout(store, DAY, "cardio");
  assert.deepEqual(workout.cardio, { optionId: "stairs" });
  assert.equal(workout.finishedAt, "2026-10-18T10:00:00.000Z");
});

test("history edits change sets and cardio in place", () => {
  let store = lat(createSeed(), rows([10, 50, true], [10, 50, true]));
  const id = findWorkout(store, DAY, "back-biceps").id;
  store = updateSets(store, id, "lat-pulldowns", rows([10, 52.5, true]));
  assert.deepEqual(findWorkout(store, DAY, "back-biceps").entries[0].sets, rows([10, 52.5, true]));

  let cardio = saveCardio(createSeed(), { date: DAY, optionId: "incline", newId, nowIso: "2026-10-18T10:00:00.000Z" });
  cardio = updateCardio(cardio, findWorkout(cardio, DAY, "cardio").id, { optionId: "run" });
  assert.deepEqual(findWorkout(cardio, DAY, "cardio").cardio, { optionId: "run" });
});

test("delete then restore puts the workout back where it was", () => {
  let store = lat(createSeed(), rows([10, 50, true]));
  store = saveCardio(store, { date: DAY, optionId: "incline", newId, nowIso: "2026-10-18T10:00:00.000Z" });
  store = saveEntry(store, { date: "2026-10-19", dayId: "legs", exerciseId: "rdls", sets: rows([10, 60, true]), newId });
  const before = store.workouts.map((w) => w.id);
  const { store: after, removed } = deleteWorkout(store, before[1]);
  assert.deepEqual(after.workouts.map((w) => w.id), [before[0], before[2]]);
  assert.equal(removed.index, 1);
  assert.deepEqual(restoreWorkout(after, removed).workouts.map((w) => w.id), before);
});

test("restoring twice doesn't duplicate the workout", () => {
  const store = lat(createSeed(), rows([10, 50, true]));
  const { store: after, removed } = deleteWorkout(store, store.workouts[0].id);
  const restored = restoreWorkout(after, removed);
  assert.equal(restoreWorkout(restored, removed).workouts.length, 1);
});

test("deleting a workout that isn't there removes nothing", () => {
  const store = lat(createSeed(), rows([10, 50, true]));
  const result = deleteWorkout(store, "missing");
  assert.equal(result.removed, null);
  assert.equal(result.store.workouts.length, 1);
});

test("operations never change the store they are given", () => {
  const store = deepFreeze(lat(createSeed(), rows([10, 50, true])));
  const id = store.workouts[0].id;
  assert.doesNotThrow(() => {
    lat(store, rows([10, 55, true]));
    finishWorkout(store, id, "2026-10-18T10:00:00.000Z");
    updateSets(store, id, "lat-pulldowns", rows([8, 50, true]));
    deleteWorkout(store, id);
    saveCardio(store, { date: DAY, optionId: "run", newId, nowIso: "2026-10-18T10:00:00.000Z" });
  });
});
