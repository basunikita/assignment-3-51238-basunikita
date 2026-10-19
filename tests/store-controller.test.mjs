import assert from "node:assert/strict";
import test from "node:test";
import { addExercise } from "../lib/exercises.ts";
import { STORAGE_KEY } from "../lib/storage.ts";
import { createStoreController } from "../lib/store-controller.ts";
import { fakeStorage } from "./helpers.mjs";

const clock = () => new Date(2026, 9, 18, 9, 0);
const add = (name) => (store) => addExercise(store, { name, dayId: "extra" }).store;

test("the first snapshot loads (and seeds) storage", () => {
  const storage = fakeStorage();
  const controller = createStoreController(storage, clock);
  const snapshot = controller.getSnapshot();
  assert.equal(snapshot.status, "seeded");
  assert.equal(snapshot.store.exercises.length, 19);
  assert.equal(controller.getSnapshot(), snapshot); // stable between reads
});

test("update applies the change to the latest saved store, not a stale copy", () => {
  const storage = fakeStorage();
  const tabA = createStoreController(storage, clock);
  const tabB = createStoreController(storage, clock);
  tabA.getSnapshot();
  tabB.getSnapshot();
  tabA.update(add("Leg press"));
  tabB.update(add("Cable crunch"));
  const saved = JSON.parse(storage.getItem(STORAGE_KEY));
  assert.ok(saved.exercises.some((e) => e.name === "Leg press"));
  assert.ok(saved.exercises.some((e) => e.name === "Cable crunch"));
});

test("update returns the new store and the snapshot follows it", () => {
  const controller = createStoreController(fakeStorage(), clock);
  const updated = controller.update(add("Leg press"));
  assert.ok(updated.exercises.some((e) => e.name === "Leg press"));
  assert.equal(controller.getSnapshot().store, updated);
});

test("a failed save switches to unavailable and keeps the change in memory", () => {
  const storage = fakeStorage();
  const controller = createStoreController(storage, clock);
  controller.getSnapshot();
  storage.setItem = () => {
    throw new Error("QuotaExceededError");
  };
  controller.update(add("Leg press"));
  const snapshot = controller.getSnapshot();
  assert.equal(snapshot.status, "unavailable");
  assert.ok(snapshot.store.exercises.some((e) => e.name === "Leg press"));
  // Later changes keep building on the in-memory store.
  controller.update(add("Cable crunch"));
  assert.equal(controller.getSnapshot().store.exercises.filter((e) => e.custom).length, 2);
});

test("subscribers hear about updates until they unsubscribe", () => {
  const controller = createStoreController(fakeStorage(), clock);
  let calls = 0;
  const unsubscribe = controller.subscribe(() => calls++);
  controller.update(add("Leg press"));
  assert.equal(calls, 1);
  unsubscribe();
  controller.update(add("Cable crunch"));
  assert.equal(calls, 1);
});

test("refresh picks up a change another tab saved", () => {
  const storage = fakeStorage();
  const tabA = createStoreController(storage, clock);
  const tabB = createStoreController(storage, clock);
  tabB.getSnapshot();
  tabA.update(add("Leg press"));
  let heard = 0;
  tabB.subscribe(() => heard++);
  tabB.refresh();
  assert.equal(heard, 1);
  assert.ok(tabB.getSnapshot().store.exercises.some((e) => e.name === "Leg press"));
});

test("a recovered banner can be dismissed", () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, "{nope");
  const controller = createStoreController(storage, clock);
  assert.equal(controller.getSnapshot().status, "recovered");
  controller.dismissStatus();
  assert.equal(controller.getSnapshot().status, "ok");
});
