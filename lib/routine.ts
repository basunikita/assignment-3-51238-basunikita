import type { CardioOptionId, DayId, StrengthDayId, Tone } from "./types.ts";

// Nikita's routine from Assignment 2: every strength exercise is 3 sets of 10.
export const TARGET_SETS = 3;
export const TARGET_REPS = 10;
// The suggested weight goes up by this much when every set reached its reps.
export const WEIGHT_STEP = 5;

export type DayInfo = { id: DayId; name: string; tone: Tone; kind: "strength" | "cardio" | "rest" };

export const DAYS: DayInfo[] = [
  { id: "back-biceps", name: "Back and biceps", tone: "upper", kind: "strength" },
  { id: "shoulders-triceps", name: "Shoulders and triceps", tone: "upper", kind: "strength" },
  { id: "legs", name: "Legs", tone: "legs", kind: "strength" },
  { id: "cardio", name: "Cardio", tone: "cardio", kind: "cardio" },
  { id: "rest", name: "Rest", tone: "rest", kind: "rest" },
];

// Names exactly as Nikita wrote them.
export const ROUTINE_EXERCISES: Record<StrengthDayId, string[]> = {
  "back-biceps": [
    "Lat pulldowns",
    "Face pulls",
    "Single-arm dumbbell rows",
    "Lower back hyperextensions",
    "African bicep curls",
    "Cable bicep curls",
    "Barbell curls",
  ],
  "shoulders-triceps": [
    "Cable lateral raise",
    "Shoulder superset: O movements and serving platters",
    "Archer pull",
    "Front raise cable",
    "Overhead tricep extension cable",
    "Tricep cross extension",
    "Tricep press",
  ],
  legs: ["Hip thrusts", "RDLs", "Bulgarian split squats", "Hip abduction / adduction", "Glute hyperextensions"],
};

export const CARDIO_OPTIONS: { id: CardioOptionId; label: string; detail: string }[] = [
  { id: "run", label: "Run 30 min", detail: "Walk 5 min, run 30 min, walk 5 min" },
  { id: "intervals", label: "Run–walk intervals", detail: "Walk 5 min, (run 15 min, walk 1 min) × 3, walk 5 min" },
  { id: "incline", label: "Incline walk", detail: "30 min walking at level 12 incline, 3 mph" },
  { id: "stairs", label: "Stairs", detail: "25 min of stairs at intensity 7" },
];

// Badges name the body part (Nikita's Assignment 2 decision).
export const TONE_LABELS: Record<Tone, string> = { upper: "Upper body", legs: "Legs", cardio: "Cardio", rest: "Rest" };

export function dayInfo(id: string): DayInfo | undefined {
  return DAYS.find((day) => day.id === id);
}
