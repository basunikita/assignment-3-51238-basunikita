import { addDays, formatLong, formatShort, parseDateKey, weekStart } from "./dates.ts";
import { CARDIO_OPTIONS, dayInfo, TARGET_REPS, TARGET_SETS } from "./routine.ts";
import type { SetRow, Store, Tone, Workout } from "./types.ts";
import { countsAsWorkout, isLogged } from "./workouts.ts";

// One date's logged sets for an exercise, across every workout that day.
export type Session = { date: string; sets: SetRow[]; max: number };

export type StripDay = {
  date: string;
  letter: string;
  dayNumber: number;
  tones: Tone[];
  label: string;
  isToday: boolean;
  isFuture: boolean;
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function sessionsFor(store: Store, exerciseId: string): Session[] {
  const byDate = new Map<string, SetRow[]>();
  for (const workout of store.workouts) {
    for (const entry of workout.entries) {
      if (entry.exerciseId !== exerciseId) continue;
      const logged = entry.sets.filter(isLogged);
      if (logged.length) byDate.set(workout.date, [...(byDate.get(workout.date) ?? []), ...logged]);
    }
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sets]) => ({ date, sets, max: Math.max(...sets.map((set) => set.weight as number)) }));
}

export function lastSession(store: Store, exerciseId: string, today: string): Session | null {
  return sessionsFor(store, exerciseId).filter((session) => session.date < today).at(-1) ?? null;
}

export function bestWeight(store: Store, exerciseId: string, beforeDate?: string): number | null {
  const sessions = sessionsFor(store, exerciseId).filter((session) => beforeDate === undefined || session.date < beforeDate);
  return sessions.length ? Math.max(...sessions.map((session) => session.max)) : null;
}

export function newBest(store: Store, exerciseId: string, today: string, weight: number): { previous: number } | null {
  const previous = bestWeight(store, exerciseId, today);
  return previous !== null && weight > previous ? { previous } : null;
}

export function maxWeightSeries(store: Store, exerciseId: string): { date: string; max: number }[] {
  return sessionsFor(store, exerciseId).map(({ date, max }) => ({ date, max }));
}

export function chartSummary(name: string, series: { date: string; max: number }[]): string {
  if (series.length === 0) return `No sets logged yet for ${name}.`;
  const first = series[0];
  if (series.length === 1) return `Max weight for ${name}: ${first.max} lb on ${formatShort(first.date)}, 1 session.`;
  const last = series[series.length - 1];
  return `Max weight for ${name} went from ${first.max} lb on ${formatShort(first.date)} to ${last.max} lb on ${formatShort(last.date)}, over ${series.length} sessions.`;
}

// Today's starting rows: last time's sets by position, nothing ticked, at least three rows.
export function prefillRows(last: Session | null): SetRow[] {
  if (!last) return Array.from({ length: TARGET_SETS }, () => ({ reps: TARGET_REPS, weight: null, done: false }));
  const rows = last.sets.map((set) => ({ reps: set.reps, weight: set.weight, done: false }));
  while (rows.length < TARGET_SETS) rows.push({ ...rows[rows.length - 1] });
  return rows;
}

const weightText = (weight: number) => (weight === 0 ? "bodyweight" : `${weight} lb`);

export function formatSets(sets: SetRow[]): string {
  const logged = sets.filter(isLogged);
  if (!logged.length) return "";
  const weights = new Set(logged.map((set) => set.weight));
  const join = (weight: number) => (weight === 0 ? " · " : " @ ");
  if (weights.size > 1) return logged.map((set) => `${set.reps}${join(set.weight as number)}${weightText(set.weight as number)}`).join(", ");
  const weight = logged[0].weight as number;
  const reps = logged.map((set) => set.reps);
  const repsText = new Set(reps).size === 1 ? `${logged.length} × ${reps[0]}` : reps.join(", ");
  return `${repsText}${join(weight)}${weightText(weight)}`;
}

export function exerciseProgress(workout: Workout | undefined, exerciseId: string): { done: number; total: number } {
  const sets = workout?.entries.find((entry) => entry.exerciseId === exerciseId)?.sets ?? [];
  return { done: sets.filter((set) => set.done).length, total: sets.length };
}

export function workoutSummary(store: Store, workout: Workout): string {
  if (workout.cardio) {
    const option = CARDIO_OPTIONS.find((candidate) => candidate.id === workout.cardio?.optionId);
    return option?.label ?? "Cardio";
  }
  const loggedCounts = workout.entries.map((entry) => entry.sets.filter(isLogged).length).filter((count) => count > 0);
  const sets = loggedCounts.reduce((sum, count) => sum + count, 0);
  return `${plural(loggedCounts.length, "exercise")}, ${plural(sets, "set")}`;
}

function countingWorkoutsOn(store: Store, date: string): Workout[] {
  return store.workouts.filter((workout) => workout.date === date && countsAsWorkout(workout));
}

export function weekStrip(store: Store, today: string): StripDay[] {
  const monday = weekStart(today);
  return Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(monday, offset);
    const days = countingWorkoutsOn(store, date).map((workout) => dayInfo(workout.dayId));
    const names = days.map((day) => day?.name ?? "Workout");
    return {
      date,
      letter: formatLong(date)[0],
      dayNumber: (parseDateKey(date) as Date).getDate(),
      tones: days.map((day) => day?.tone ?? "rest"),
      label: `${formatLong(date)}: ${names.length ? names.join(" and ") : "nothing logged"}`,
      isToday: date === today,
      isFuture: date > today,
    };
  });
}

// Weeks in a row (Monday to Sunday) with a workout. An empty current week doesn't break the
// streak until it's over, so counting starts from last week in that case.
export function streakWeeks(store: Store, today: string): number {
  const trainedWeeks = new Set(store.workouts.filter(countsAsWorkout).map((workout) => weekStart(workout.date)));
  let week = weekStart(today);
  if (!trainedWeeks.has(week)) week = addDays(week, -7);
  let streak = 0;
  while (trainedWeeks.has(week)) {
    streak += 1;
    week = addDays(week, -7);
  }
  return streak;
}

// The line under an exercise on the workout page: what you did last time.
export function lastTimeLine(last: Session | null): string {
  return last ? `Last ${formatSets(last.sets)}` : "Not logged yet";
}

// How many exercises in this workout beat their best from earlier dates.
export function newBestCount(store: Store, workout: Workout): number {
  return workout.entries.filter((entry) => {
    const weights = entry.sets.filter(isLogged).map((set) => set.weight as number);
    return weights.length > 0 && newBest(store, entry.exerciseId, workout.date, Math.max(...weights)) !== null;
  }).length;
}

// The line under an exercise on the day page: today's logged sets once there are any,
// otherwise what was lifted last time.
export function exerciseLine(store: Store, exerciseId: string, today: string, workout: Workout | undefined): string {
  const todays = workout?.entries.find((entry) => entry.exerciseId === exerciseId)?.sets.filter(isLogged) ?? [];
  if (todays.length) return `Today ${formatSets(todays)}`;
  return lastTimeLine(lastSession(store, exerciseId, today));
}

// A workout's line in History: unfinished strength workouts are marked as in progress.
export function historyLine(store: Store, workout: Workout): string {
  const open = !workout.finishedAt && !workout.cardio;
  return `${workoutSummary(store, workout)}${open ? " · in progress" : ""}`;
}
