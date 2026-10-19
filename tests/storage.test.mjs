import assert from "node:assert/strict";
import test from "node:test";
import { CARDIO_OPTIONS, DAYS, dayInfo, ROUTINE_EXERCISES } from "../lib/routine.ts";
import { createSeed } from "../lib/seed.ts";
import { loadStore, parseStore, saveStore, STORAGE_KEY } from "../lib/storage.ts";
import { fakeStorage } from "./helpers.mjs";

const NOW = new Date(2026, 9, 18, 9, 30);

test("the routine has five days in order with their tones", () => {
  assert.deepEqual(
    DAYS.map((day) => [day.id, day.name, day.tone, day.kind]),
    [
      ["back-biceps", "Back and biceps", "upper", "strength"],
      ["shoulders-triceps", "Shoulders and triceps", "upper", "strength"],
      ["legs", "Legs", "legs", "strength"],
      ["cardio", "Cardio", "cardio", "cardio"],
      ["rest", "Rest", "rest", "rest"],
    ],
  );
  assert.equal(dayInfo("legs")?.name, "Legs");
  assert.equal(dayInfo("nope"), undefined);
});

test("cardio options are the four from the routine", () => {
  assert.deepEqual(
    CARDIO_OPTIONS.map((option) => [option.id, option.label]),
    [
      ["run", "Run 30 min"],
      ["intervals", "Run–walk intervals"],
      ["incline", "Incline walk"],
      ["stairs", "Stairs"],
    ],
  );
});

test("seed ids are slugs and the day lists match the routine", () => {
  const seed = createSeed();
  assert.equal(seed.version, 1);
  assert.equal(seed.exercises.length, 19);
  assert.deepEqual(seed.workouts, []);
  assert.deepEqual(seed.settings, { restSeconds: 90 });
  const ids = seed.exercises.map((exercise) => exercise.id);
  for (const id of ["lat-pulldowns", "rdls", "hip-abduction-adduction", "shoulder-superset-o-movements-and-serving-platters"]) {
    assert.ok(ids.includes(id), id);
  }
  assert.equal(new Set(ids).size, ids.length);
  for (const [dayId, names] of Object.entries(ROUTINE_EXERCISES)) {
    assert.deepEqual(
      seed.exercises.filter((exercise) => exercise.dayId === dayId).map((exercise) => exercise.name),
      names,
    );
  }
  assert.ok(seed.exercises.every((exercise) => exercise.custom === false));
});

test("first load writes the seed", () => {
  const storage = fakeStorage();
  const { store, status } = loadStore(storage, NOW);
  assert.equal(status, "seeded");
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), store);
});

test("a saved store round-trips", () => {
  const storage = fakeStorage();
  const { store } = loadStore(storage, NOW);
  const changed = { ...store, settings: { restSeconds: 60 } };
  assert.equal(saveStore(storage, changed), true);
  const again = loadStore(storage, NOW);
  assert.equal(again.status, "ok");
  assert.deepEqual(again.store, changed);
});

test("unreadable data is kept and replaced with a fresh seed", () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, "{nope");
  const { store, status } = loadStore(storage, NOW);
  assert.equal(status, "recovered");
  assert.equal(storage.getItem(`plate-log:unreadable-${NOW.getTime()}`), "{nope");
  assert.deepEqual(store, createSeed());
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), createSeed());
});

test("data with the wrong shape counts as unreadable", () => {
  assert.equal(parseStore('{"version":2}'), null);
  assert.equal(parseStore('{"version":1,"exercises":"x","workouts":[],"settings":{"restSeconds":90}}'), null);
  assert.equal(parseStore("null"), null);
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, '{"version":2}');
  assert.equal(loadStore(storage, NOW).status, "recovered");
});

test("no storage at all runs on an in-memory seed", () => {
  const { store, status } = loadStore(null, NOW);
  assert.equal(status, "unavailable");
  assert.deepEqual(store, createSeed());
});

test("storage that throws on read is unavailable", () => {
  const { store, status } = loadStore(fakeStorage({ failReads: true }), NOW);
  assert.equal(status, "unavailable");
  assert.deepEqual(store, createSeed());
});

test("saveStore reports false instead of throwing when storage is full", () => {
  assert.equal(saveStore(fakeStorage({ failWrites: true }), createSeed()), false);
  assert.equal(saveStore(null, createSeed()), false);
});

test("a seed that can't be written still loads, as unavailable", () => {
  const { status } = loadStore(fakeStorage({ failWrites: true }), NOW);
  assert.equal(status, "unavailable");
});

test("cardio saved before minutes were removed still loads", () => {
  const storage = fakeStorage();
  const old = { ...createSeed(), workouts: [{ id: "c", date: "2026-10-16", dayId: "cardio", entries: [], cardio: { optionId: "incline", minutes: 30 }, finishedAt: "x" }] };
  storage.setItem(STORAGE_KEY, JSON.stringify(old));
  assert.equal(loadStore(storage, NOW).status, "ok");
});
