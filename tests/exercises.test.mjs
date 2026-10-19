import assert from "node:assert/strict";
import test from "node:test";
import { addExercise, exercisesForDay, extraExercises, findByName, findExercise, normalizeName, slugify } from "../lib/exercises.ts";
import { createSeed } from "../lib/seed.ts";

test("slugify makes url-safe ids", () => {
  assert.equal(slugify("Lat pulldowns"), "lat-pulldowns");
  assert.equal(slugify("Hip abduction / adduction"), "hip-abduction-adduction");
  assert.equal(slugify("RDLs"), "rdls");
  assert.equal(slugify("!!!"), "exercise");
});

test("normalizeName trims, squashes spaces and ignores case", () => {
  assert.equal(normalizeName("  face   PULLS "), "face pulls");
});

test("duplicate names match ignoring case and spacing", () => {
  assert.equal(findByName(createSeed(), "  face   PULLS ")?.id, "face-pulls");
  assert.equal(findByName(createSeed(), "Leg press"), undefined);
});

test("addExercise gives a unique id and keeps the typed name, trimmed", () => {
  const { store, exercise } = addExercise(createSeed(), { name: " Lat pulldowns! ", dayId: "extra" });
  assert.equal(exercise.id, "lat-pulldowns-2");
  assert.equal(exercise.name, "Lat pulldowns!");
  assert.equal(exercise.custom, true);
  assert.deepEqual(findExercise(store, "lat-pulldowns-2"), exercise);
  const third = addExercise(store, { name: "Lat pulldowns!!", dayId: "legs" });
  assert.equal(third.exercise.id, "lat-pulldowns-3");
});

test("a name with no letters or numbers still gets an id", () => {
  assert.equal(addExercise(createSeed(), { name: "!!!", dayId: "extra" }).exercise.id, "exercise");
});

test("extras are listed apart from the routine days", () => {
  const { store } = addExercise(createSeed(), { name: "Leg press", dayId: "extra" });
  assert.deepEqual(extraExercises(store).map((e) => e.name), ["Leg press"]);
  assert.ok(!exercisesForDay(store, "legs").some((e) => e.name === "Leg press"));
  assert.equal(exercisesForDay(store, "legs").length, 5);
});

test("an exercise added to a day joins the end of that day's list", () => {
  const { store } = addExercise(createSeed(), { name: "Leg press", dayId: "legs" });
  assert.equal(exercisesForDay(store, "legs").at(-1)?.name, "Leg press");
});

test("addExercise doesn't change the store it was given", () => {
  const seed = createSeed();
  addExercise(seed, { name: "Leg press", dayId: "extra" });
  assert.equal(seed.exercises.length, 19);
});
