"use client";

import Link from "next/link";
import { formatDayShort, formatShort } from "@/lib/dates";
import { exercisesForDay, extraExercises } from "@/lib/exercises";
import { DAYS, TARGET_REPS, TARGET_SETS, dayInfo, type DayInfo } from "@/lib/routine";
import { exerciseProgress, streakWeeks, weekStrip } from "@/lib/stats";
import { useStore } from "@/lib/store-client";
import type { StrengthDayId, Store, Workout } from "@/lib/types";
import { countsAsWorkout } from "@/lib/workouts";
import DayCard from "../components/DayCard";
import LoadGate from "../components/LoadGate";
import StreakBadge from "../components/StreakBadge";
import WeekStrip from "../components/WeekStrip";
import { useRecipe } from "../design-system/RecipeContext";

function exerciseCount(store: Store, dayId: StrengthDayId): number {
  return exercisesForDay(store, dayId).length + extraExercises(store).length;
}

function dayMeta(store: Store, day: DayInfo): string {
  if (day.kind === "cardio") return "4 options";
  if (day.kind === "rest") return "Nothing to log";
  return `${exerciseCount(store, day.id as StrengthDayId)} exercises · ${TARGET_SETS} × ${TARGET_REPS}`;
}

function exercisesDone(workout: Workout): number {
  return workout.entries.filter((entry) => {
    const { done, total } = exerciseProgress(workout, entry.exerciseId);
    return total > 0 && done === total;
  }).length;
}

function Today({ store, today }: { store: Store; today: string }) {
  const recipe = useRecipe();
  const counting = store.workouts.filter(countsAsWorkout);
  const firstVisit = counting.length === 0;
  const heading = "Which day are you doing?";

  const dayPicker = (
    <ul className="grid gap-3">
      {DAYS.map((day) => {
        const last = counting.filter((workout) => workout.dayId === day.id).at(-1);
        return (
          <li key={day.id}>
            <DayCard day={day} meta={dayMeta(store, day)} lastDone={last ? `Last done ${formatShort(last.date)}` : undefined} href={`/workout/${day.id}`} />
          </li>
        );
      })}
    </ul>
  );

  if (firstVisit) {
    return (
      <>
        <header className="grid gap-2">
          <p className={recipe.label}>Plate Log</p>
          <h1 className="font-display text-5xl font-black uppercase leading-none">{heading}</h1>
          <p className="text-lg">Your routine is loaded. Pick today&apos;s day and log each set as you go.</p>
        </header>
        {dayPicker}
      </>
    );
  }

  const unfinished = counting.find((workout) => workout.date === today && !workout.finishedAt && workout.dayId !== "cardio");
  const unfinishedDay = unfinished ? dayInfo(unfinished.dayId) : undefined;
  const lastWorkout = [...counting].sort((a, b) => a.date.localeCompare(b.date)).at(-1) as Workout;
  const lastDay = dayInfo(lastWorkout.dayId);

  return (
    <>
      <header className="grid gap-2">
        <p className={recipe.label}>Plate Log</p>
        <h1 className="font-display text-5xl font-black uppercase leading-none">Welcome back</h1>
      </header>

      {unfinished && unfinishedDay && (
        <Link
          href={`/workout/${unfinished.dayId}`}
          className={`${recipe.button.base} ${recipe.button.primary} ${recipe.focus} justify-between text-left`}
        >
          <span>
            Continue {unfinishedDay.name}
            <span className="block font-body text-base font-bold normal-case">
              {exercisesDone(unfinished)} of {exerciseCount(store, unfinished.dayId as StrengthDayId)} exercises done
            </span>
          </span>
          <span aria-hidden="true">›</span>
        </Link>
      )}

      <section aria-labelledby="week-heading" className={`${recipe.panel} grid gap-4`}>
        <h2 id="week-heading" className={recipe.label}>
          This week
        </h2>
        <WeekStrip days={weekStrip(store, today)} />
        <StreakBadge weeks={streakWeeks(store, today)} />
        <p className="font-bold">
          Last workout:{" "}
          <Link href={`/history/${lastWorkout.date}`} className={`${recipe.link} ${recipe.focus}`}>
            {lastDay?.name} · {formatDayShort(lastWorkout.date)}
          </Link>
        </p>
      </section>

      <section aria-labelledby="pick-heading" className="grid gap-3">
        <h2 id="pick-heading" className={recipe.sectionTitle}>
          {heading}
        </h2>
        {dayPicker}
      </section>
    </>
  );
}

export default function TodayScreen() {
  const { today } = useStore();
  return <LoadGate>{({ store }) => <Today store={store} today={today()} />}</LoadGate>;
}
