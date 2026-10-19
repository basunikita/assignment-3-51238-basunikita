import { addDays, weekStart } from "./dates.ts";
import { exercisesForDay } from "./exercises.ts";
import { TARGET_REPS, TARGET_SETS, WEIGHT_STEP } from "./routine.ts";
import { createSeed } from "./seed.ts";
import type { CardioOptionId, SetRow, StrengthDayId, Store, Workout } from "./types.ts";

// Starting weights for the sample (lb). Missing exercises are bodyweight (0).
const START_WEIGHTS: Record<string, number> = {
  "lat-pulldowns": 50,
  "face-pulls": 25,
  "single-arm-dumbbell-rows": 20,
  "african-bicep-curls": 15,
  "cable-bicep-curls": 20,
  "barbell-curls": 30,
  "cable-lateral-raise": 10,
  "archer-pull": 15,
  "front-raise-cable": 10,
  "overhead-tricep-extension-cable": 20,
  "tricep-cross-extension": 15,
  "tricep-press": 40,
  "hip-thrusts": 95,
  rdls: 65,
  "bulgarian-split-squats": 20,
  "hip-abduction-adduction": 70,
};

// Days of the week (0 = Monday) each workout falls on.
const PLAN: { dayId: StrengthDayId | "cardio"; offset: number }[] = [
  { dayId: "back-biceps", offset: 0 },
  { dayId: "cardio", offset: 1 },
  { dayId: "shoulders-triceps", offset: 2 },
  { dayId: "legs", offset: 4 },
];
const CARDIO_ROTATION: CardioOptionId[] = ["incline", "run", "stairs", "intervals"];
// Weeks before the current one: four weeks ago, then a missed week, then the last two.
const WEEKS_BACK = [4, 2, 1];

// Three weeks of past workouts so review rounds can see "last time", the suggestion, new bests,
// the chart, the week strip and the streak. Nothing is dated in the current week.
export function createSampleStore(today: string, newId: () => string): Store {
  const seed = createSeed();
  const thisWeek = weekStart(today);
  const workouts: Workout[] = [];

  WEEKS_BACK.forEach((weeksBack, session) => {
    const monday = addDays(thisWeek, -7 * weeksBack);
    for (const { dayId, offset } of PLAN) {
      const date = addDays(monday, offset);
      const finishedAt = `${date}T18:00:00.000Z`;
      if (dayId === "cardio") {
        workouts.push({ id: newId(), date, dayId, entries: [], cardio: { optionId: CARDIO_ROTATION[session % CARDIO_ROTATION.length] }, finishedAt });
        continue;
      }
      const entries = exercisesForDay(seed, dayId).map((exercise) => {
        const start = START_WEIGHTS[exercise.id] ?? 0;
        const weight = start === 0 ? 0 : start + WEIGHT_STEP * session;
        // The middle session of Lat pulldowns misses reps on the last set, so the next
        // suggestion stays at the same weight before climbing again.
        const missedReps = exercise.id === "lat-pulldowns" && session === 1;
        const sets: SetRow[] = Array.from({ length: TARGET_SETS }, (_, i) => ({
          reps: missedReps && i === TARGET_SETS - 1 ? TARGET_REPS - 2 : TARGET_REPS,
          weight,
          done: true,
        }));
        return { exerciseId: exercise.id, sets };
      });
      workouts.push({ id: newId(), date, dayId, entries, finishedAt });
    }
  });

  return { ...seed, workouts };
}
