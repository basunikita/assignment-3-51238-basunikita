import type { CardioOptionId, DayId, SetRow, StrengthDayId, Store, Workout } from "./types.ts";

export type Removed = { workout: Workout; index: number };
type Cardio = { optionId: CardioOptionId };

export function findWorkout(store: Store, date: string, dayId: DayId): Workout | undefined {
  return store.workouts.find((workout) => workout.date === date && workout.dayId === dayId);
}

export function workoutsOn(store: Store, date: string): Workout[] {
  return store.workouts.filter((workout) => workout.date === date);
}

export function isLogged(set: SetRow): boolean {
  return set.done && set.reps !== null && set.reps >= 1 && set.weight !== null && set.weight >= 0;
}

// Whether a workout shows up in history, the week strip and the streak.
export function countsAsWorkout(workout: Workout): boolean {
  return workout.cardio !== undefined || workout.entries.some((entry) => entry.sets.some(isLogged));
}

function replaceWorkout(store: Store, workout: Workout): Store {
  return { ...store, workouts: store.workouts.map((existing) => (existing.id === workout.id ? workout : existing)) };
}

function withSets(workout: Workout, exerciseId: string, sets: SetRow[]): Workout {
  const copied = sets.map((set) => ({ ...set }));
  const exists = workout.entries.some((entry) => entry.exerciseId === exerciseId);
  const entries = exists
    ? workout.entries.map((entry) => (entry.exerciseId === exerciseId ? { exerciseId, sets: copied } : entry))
    : [...workout.entries, { exerciseId, sets: copied }];
  return { ...workout, entries };
}

// Saves one exercise's rows in today's workout for that day. The workout is only created by the
// first ticked set, so typing (or opening a day by mistake) leaves nothing behind in history.
export function saveEntry(
  store: Store,
  args: { date: string; dayId: StrengthDayId; exerciseId: string; sets: SetRow[]; newId: () => string },
): Store {
  const existing = findWorkout(store, args.date, args.dayId);
  if (existing) return replaceWorkout(store, withSets(existing, args.exerciseId, args.sets));
  if (!args.sets.some((set) => set.done)) return store;
  const created = withSets({ id: args.newId(), date: args.date, dayId: args.dayId, entries: [] }, args.exerciseId, args.sets);
  return { ...store, workouts: [...store.workouts, created] };
}

export function finishWorkout(store: Store, workoutId: string, nowIso: string): Store {
  const workout = store.workouts.find((candidate) => candidate.id === workoutId);
  return workout ? replaceWorkout(store, { ...workout, finishedAt: nowIso }) : store;
}

export function saveCardio(
  store: Store,
  args: { date: string; optionId: CardioOptionId; newId: () => string; nowIso: string },
): Store {
  const cardio: Cardio = { optionId: args.optionId };
  const existing = findWorkout(store, args.date, "cardio");
  if (existing) return replaceWorkout(store, { ...existing, cardio, finishedAt: existing.finishedAt ?? args.nowIso });
  const created: Workout = { id: args.newId(), date: args.date, dayId: "cardio", entries: [], cardio, finishedAt: args.nowIso };
  return { ...store, workouts: [...store.workouts, created] };
}

export function updateSets(store: Store, workoutId: string, exerciseId: string, sets: SetRow[]): Store {
  const workout = store.workouts.find((candidate) => candidate.id === workoutId);
  return workout ? replaceWorkout(store, withSets(workout, exerciseId, sets)) : store;
}

export function updateCardio(store: Store, workoutId: string, cardio: Cardio): Store {
  const workout = store.workouts.find((candidate) => candidate.id === workoutId);
  return workout ? replaceWorkout(store, { ...workout, cardio: { ...cardio } }) : store;
}

export function deleteWorkout(store: Store, workoutId: string): { store: Store; removed: Removed | null } {
  const index = store.workouts.findIndex((workout) => workout.id === workoutId);
  if (index === -1) return { store, removed: null };
  const workouts = store.workouts.filter((_, i) => i !== index);
  return { store: { ...store, workouts }, removed: { workout: store.workouts[index], index } };
}

export function restoreWorkout(store: Store, removed: Removed): Store {
  if (store.workouts.some((workout) => workout.id === removed.workout.id)) return store;
  const index = Math.min(removed.index, store.workouts.length);
  const workouts = [...store.workouts.slice(0, index), removed.workout, ...store.workouts.slice(index)];
  return { ...store, workouts };
}
