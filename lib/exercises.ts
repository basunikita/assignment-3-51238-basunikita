import type { Exercise, StrengthDayId, Store } from "./types.ts";

export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "exercise";
}

// How two names are compared for duplicates.
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function findExercise(store: Store, id: string): Exercise | undefined {
  return store.exercises.find((exercise) => exercise.id === id);
}

export function exercisesForDay(store: Store, dayId: StrengthDayId): Exercise[] {
  return store.exercises.filter((exercise) => exercise.dayId === dayId);
}

export function extraExercises(store: Store): Exercise[] {
  return store.exercises.filter((exercise) => exercise.dayId === "extra");
}

export function findByName(store: Store, name: string): Exercise | undefined {
  const wanted = normalizeName(name);
  return store.exercises.find((exercise) => normalizeName(exercise.name) === wanted);
}

function uniqueId(store: Store, base: string): string {
  const taken = new Set(store.exercises.map((exercise) => exercise.id));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function addExercise(store: Store, input: { name: string; dayId: StrengthDayId | "extra" }): { store: Store; exercise: Exercise } {
  const name = input.name.trim().replace(/\s+/g, " ");
  const exercise: Exercise = { id: uniqueId(store, slugify(name)), name, dayId: input.dayId, custom: true };
  return { store: { ...store, exercises: [...store.exercises, exercise] }, exercise };
}
