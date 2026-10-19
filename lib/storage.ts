import { parseDateKey } from "./dates.ts";
import { createSeed } from "./seed.ts";
import type { LoadStatus, Store } from "./types.ts";

export const STORAGE_KEY = "plate-log:v1";

const EXERCISE_DAYS = new Set(["back-biceps", "shoulders-triceps", "legs", "extra"]);
const WORKOUT_DAYS = new Set(["back-biceps", "shoulders-triceps", "legs", "cardio"]);
const REST_LENGTHS = new Set([60, 90, 120]);

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

function isStore(value: unknown): value is Store {
  if (!isObject(value) || value.version !== 1) return false;
  const { exercises, workouts, settings } = value;
  if (!Array.isArray(exercises) || !Array.isArray(workouts) || !isObject(settings)) return false;
  if (!REST_LENGTHS.has(settings.restSeconds as number)) return false;
  const exercisesOk = exercises.every(
    (e) => isObject(e) && typeof e.id === "string" && typeof e.name === "string" && EXERCISE_DAYS.has(e.dayId as string) && typeof e.custom === "boolean",
  );
  const workoutsOk = workouts.every(
    (w) =>
      isObject(w) &&
      typeof w.id === "string" &&
      typeof w.date === "string" &&
      parseDateKey(w.date) !== null &&
      WORKOUT_DAYS.has(w.dayId as string) &&
      Array.isArray(w.entries) &&
      w.entries.every((entry) => isObject(entry) && typeof entry.exerciseId === "string" && Array.isArray(entry.sets)),
  );
  return exercisesOk && workoutsOk;
}

export function parseStore(raw: string): Store | null {
  try {
    const value: unknown = JSON.parse(raw);
    return isStore(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveStore(storage: Storage | null, store: Store): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function loadStore(storage: Storage | null, now: Date): { store: Store; status: LoadStatus } {
  if (!storage) return { store: createSeed(), status: "unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { store: createSeed(), status: "unavailable" };
  }

  if (raw !== null) {
    const saved = parseStore(raw);
    if (saved) return { store: saved, status: "ok" };
  }

  const seed = createSeed();
  if (raw !== null) {
    // Keep what couldn't be read rather than throwing it away.
    try {
      storage.setItem(`plate-log:unreadable-${now.getTime()}`, raw);
    } catch {
      return { store: seed, status: "unavailable" };
    }
  }
  if (!saveStore(storage, seed)) return { store: seed, status: "unavailable" };
  return { store: seed, status: raw === null ? "seeded" : "recovered" };
}
