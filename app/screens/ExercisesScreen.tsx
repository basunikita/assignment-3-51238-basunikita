"use client";

import Link from "next/link";
import { formatShort } from "@/lib/dates";
import { exercisesForDay, extraExercises } from "@/lib/exercises";
import { DAYS } from "@/lib/routine";
import { bestWeight, sessionsFor } from "@/lib/stats";
import type { Exercise, StrengthDayId, Store } from "@/lib/types";
import LoadGate from "../components/LoadGate";
import PageHeader from "../components/PageHeader";
import { useRecipe } from "../design-system/RecipeContext";

function bestText(best: number | null): string {
  if (best === null) return "Not logged yet";
  return best === 0 ? "Best: bodyweight" : `Best ${best} lb`;
}

function Exercises({ store }: { store: Store }) {
  const recipe = useRecipe();
  const groups: { title: string; exercises: Exercise[] }[] = [
    ...DAYS.filter((day) => day.kind === "strength").map((day) => ({ title: day.name, exercises: exercisesForDay(store, day.id as StrengthDayId) })),
    { title: "Extras", exercises: extraExercises(store) },
  ];

  return (
    <>
      <PageHeader title="Exercises" meta="Your bests, and every exercise in your routine" />
      <Link href="/exercises/new" className={`${recipe.button.base} ${recipe.button.primary} ${recipe.focus}`}>
        Add exercise
      </Link>
      {groups.map((group) => (
        <section key={group.title} aria-labelledby={`group-${group.title}`} className="grid gap-2">
          <h2 id={`group-${group.title}`} className={recipe.label}>
            {group.title}
          </h2>
          {group.exercises.length ? (
            <ul className={recipe.rows.list}>
              {group.exercises.map((exercise) => {
                const last = sessionsFor(store, exercise.id).at(-1);
                return (
                  <li key={exercise.id} className={recipe.rows.item}>
                    <Link href={`/exercises/${exercise.id}`} className={`${recipe.rows.row} ${recipe.focus} min-h-14 focus-state:-outline-offset-5`}>
                      <span className="grid min-w-0 gap-0.5">
                        <span className="break-words">{exercise.name}</span>
                        <span className="text-sm font-bold text-muted">
                          {bestText(bestWeight(store, exercise.id))}
                          {last ? ` · Last ${formatShort(last.date)}` : ""}
                        </span>
                      </span>
                      <span aria-hidden="true" className="font-display text-2xl">
                        ›
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="font-bold text-muted">No extras yet. Add one to use it on any day.</p>
          )}
        </section>
      ))}
    </>
  );
}

export default function ExercisesScreen() {
  return <LoadGate>{({ store }) => <Exercises store={store} />}</LoadGate>;
}
