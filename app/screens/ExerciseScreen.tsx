"use client";

import Link from "next/link";
import { formatShort } from "@/lib/dates";
import { findExercise } from "@/lib/exercises";
import { TONE_LABELS, dayInfo } from "@/lib/routine";
import { bestWeight, chartSummary, formatSets, maxWeightSeries, sessionsFor } from "@/lib/stats";
import type { Store } from "@/lib/types";
import LoadGate from "../components/LoadGate";
import MaxWeightChart from "../components/MaxWeightChart";
import PageHeader from "../components/PageHeader";
import Badge from "../design-system/components/Badge";
import StatePanel from "../design-system/components/StatePanel";
import { useRecipe } from "../design-system/RecipeContext";

const BACK = { href: "/exercises", label: "Exercises" };
const weightText = (weight: number) => (weight === 0 ? "bodyweight" : `${weight} lb`);

function ExerciseDetail({ store, id }: { store: Store; id: string }) {
  const recipe = useRecipe();
  const exercise = findExercise(store, id);
  if (!exercise) {
    return (
      <>
        <PageHeader title="Exercise not found" />
        <StatePanel
          kind="error"
          action={
            <Link href="/exercises" className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center`}>
              Back to Exercises
            </Link>
          }
        >
          We couldn&apos;t find that exercise.
        </StatePanel>
      </>
    );
  }

  const day = exercise.dayId === "extra" ? undefined : dayInfo(exercise.dayId);
  const badge = day ? <Badge tone={day.tone}>{TONE_LABELS[day.tone]}</Badge> : <Badge tone="rest">Any day</Badge>;
  const best = bestWeight(store, exercise.id);
  const sessions = sessionsFor(store, exercise.id);
  const series = maxWeightSeries(store, exercise.id);

  return (
    <>
      <PageHeader back={BACK} title={exercise.name} badge={badge} meta={best === null ? undefined : `Best ${weightText(best)}`} />
      {sessions.length === 0 ? (
        <StatePanel kind="empty">No sets logged yet. Find it in a workout to log your first set.</StatePanel>
      ) : (
        <>
          <MaxWeightChart series={series} summary={chartSummary(exercise.name, series)} />
          <section aria-labelledby="sessions-heading" className="grid gap-2">
            <h2 id="sessions-heading" className={recipe.label}>
              Every session
            </h2>
            <ul className={recipe.rows.list}>
              {[...sessions].reverse().map((session) => (
                <li key={session.date} className={recipe.rows.item}>
                  <Link href={`/history/${session.date}`} className={`${recipe.rows.row} ${recipe.focus} min-h-14 focus-state:-outline-offset-5`}>
                    <span className="grid gap-0.5">
                      <span>{formatShort(session.date)}</span>
                      <span className="text-sm font-bold text-muted">
                        {formatSets(session.sets)} · max {weightText(session.max)}
                      </span>
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
      )}
    </>
  );
}

export default function ExerciseScreen({ id }: { id: string }) {
  return <LoadGate>{({ store }) => <ExerciseDetail store={store} id={id} />}</LoadGate>;
}
