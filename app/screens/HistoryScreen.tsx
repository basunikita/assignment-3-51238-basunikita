"use client";

import Link from "next/link";
import { useState } from "react";
import { addMonths, formatDayShort, monthOf } from "@/lib/dates";
import { dayInfo } from "@/lib/routine";
import { workoutSummary } from "@/lib/stats";
import { useStore } from "@/lib/store-client";
import type { Store, Tone, Workout } from "@/lib/types";
import { countsAsWorkout } from "@/lib/workouts";
import LoadGate from "../components/LoadGate";
import MonthCalendar from "../components/MonthCalendar";
import PageHeader from "../components/PageHeader";
import StatePanel from "../design-system/components/StatePanel";
import { useRecipe } from "../design-system/RecipeContext";

function History({ store, today }: { store: Store; today: string }) {
  const recipe = useRecipe();
  const [month, setMonth] = useState(monthOf(today));
  const counting = store.workouts.filter(countsAsWorkout);

  if (!counting.length) {
    return (
      <>
        <PageHeader title="History" />
        <StatePanel
          kind="empty"
          action={
            <Link href="/" className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center`}>
              Go to Today
            </Link>
          }
        >
          No workouts yet. Log your first one from Today.
        </StatePanel>
      </>
    );
  }

  const byDate = new Map<string, { tones: Tone[]; names: string[] }>();
  for (const workout of counting) {
    const day = dayInfo(workout.dayId);
    const entry = byDate.get(workout.date) ?? { tones: [], names: [] };
    entry.tones.push(day?.tone ?? "rest");
    entry.names.push(day?.name ?? "Workout");
    byDate.set(workout.date, entry);
  }
  // Newest first; workouts on the same date keep the order they were logged.
  const newestFirst: Workout[] = counting.map((workout, i) => ({ workout, i })).sort((a, b) => b.workout.date.localeCompare(a.workout.date) || b.i - a.i).map(({ workout }) => workout);

  return (
    <>
      <PageHeader title="History" meta={`${counting.length} workout${counting.length === 1 ? "" : "s"} logged`} />
      <MonthCalendar month={month} workoutsByDate={byDate} today={today} onMonthChange={(step) => setMonth((current) => addMonths(current, step))} />
      <section aria-labelledby="list-heading" className="grid gap-3">
        <h2 id="list-heading" className={recipe.label}>
          Every workout
        </h2>
        <ul className={recipe.rows.list}>
          {newestFirst.map((workout) => (
            <li key={workout.id} className={recipe.rows.item}>
              <Link href={`/history/${workout.date}`} className={`${recipe.rows.row} ${recipe.focus} min-h-14 focus-state:-outline-offset-5`}>
                <span className="grid gap-0.5">
                  <span>
                    {formatDayShort(workout.date)} · {dayInfo(workout.dayId)?.name}
                  </span>
                  <span className="text-sm font-bold text-muted">{workoutSummary(store, workout)}</span>
                </span>
                <span aria-hidden="true" className="font-display text-2xl">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function HistoryScreen() {
  const { today } = useStore();
  return <LoadGate>{({ store }) => <History store={store} today={today()} />}</LoadGate>;
}
