export type StrengthDayId = "back-biceps" | "shoulders-triceps" | "legs";
export type DayId = StrengthDayId | "cardio" | "rest";
export type Tone = "upper" | "legs" | "cardio" | "rest";
export type CardioOptionId = "run" | "intervals" | "incline" | "stairs";

// reps and weight are null while a field is empty or invalid; a weight of 0 is bodyweight.
export type SetRow = { reps: number | null; weight: number | null; done: boolean };
export type Entry = { exerciseId: string; sets: SetRow[] };

export type Workout = {
  id: string;
  // The device's local calendar day, YYYY-MM-DD.
  date: string;
  dayId: Exclude<DayId, "rest">;
  entries: Entry[];
  cardio?: { optionId: CardioOptionId };
  finishedAt?: string;
};

export type Exercise = { id: string; name: string; dayId: StrengthDayId | "extra"; custom: boolean };
export type Settings = { restSeconds: 60 | 90 | 120 };
export type Store = { version: 1; exercises: Exercise[]; workouts: Workout[]; settings: Settings };

// seeded: first visit; recovered: saved data was unreadable; unavailable: the browser won't save.
export type LoadStatus = "ok" | "seeded" | "recovered" | "unavailable";
