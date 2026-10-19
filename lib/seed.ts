import { slugify } from "./exercises.ts";
import { ROUTINE_EXERCISES } from "./routine.ts";
import type { StrengthDayId, Store } from "./types.ts";

// What a first visit starts with: the routine already loaded, nothing logged yet.
export function createSeed(): Store {
  const exercises = (Object.entries(ROUTINE_EXERCISES) as [StrengthDayId, string[]][]).flatMap(([dayId, names]) =>
    names.map((name) => ({ id: slugify(name), name, dayId, custom: false })),
  );
  return { version: 1, exercises, workouts: [], settings: { restSeconds: 90 } };
}
