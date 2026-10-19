"use client";

import Link from "next/link";
import { useState } from "react";
import { formatLong, parseDateKey } from "@/lib/dates";
import { findExercise } from "@/lib/exercises";
import { CARDIO_OPTIONS, TONE_LABELS, dayInfo } from "@/lib/routine";
import { useStore } from "@/lib/store-client";
import type { CardioOptionId, SetRow, Store, Workout } from "@/lib/types";
import { checkReps, checkWeight, type Checked } from "@/lib/validation";
import { countsAsWorkout, deleteWorkout, isLogged, restoreWorkout, updateCardio, updateSets, workoutsOn } from "@/lib/workouts";
import CardioPicker from "../components/CardioPicker";
import LoadGate from "../components/LoadGate";
import NumberField from "../components/NumberField";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/ToastProvider";
import Badge from "../design-system/components/Badge";
import Button from "../design-system/components/Button";
import StatePanel from "../design-system/components/StatePanel";
import { useRecipe } from "../design-system/RecipeContext";

const BACK = { href: "/history", label: "History" };

// One logged set, edited in place and saved when a field loses focus (if it's still valid).
function LoggedSet({ idPrefix, number, set, headIds, onSave, onRemove }: {
  idPrefix: string;
  number: number;
  set: SetRow;
  headIds: { reps: string; weight: string };
  onSave: (set: SetRow) => void;
  onRemove: () => void;
}) {
  const recipe = useRecipe();
  const [reps, setReps] = useState(String(set.reps));
  const [weight, setWeight] = useState(String(set.weight));
  const [errors, setErrors] = useState<{ reps?: string; weight?: string }>({});
  // When the stored set changes (a save, or a removal shifting rows up), show the new numbers
  // without remounting, so keyboard focus stays where it is.
  const [shown, setShown] = useState(set);
  if (shown.reps !== set.reps || shown.weight !== set.weight) {
    setShown(set);
    setReps(String(set.reps));
    setWeight(String(set.weight));
  }
  const labelId = `${idPrefix}-label`;
  const errorId = `${idPrefix}-error`;

  const save = () => {
    const checked: [Checked, Checked] = [checkReps(reps), checkWeight(weight)];
    const next = { reps: checked[0].error ?? undefined, weight: checked[1].error ?? undefined };
    setErrors(next);
    if (next.reps || next.weight) return;
    if (checked[0].value !== set.reps || checked[1].value !== set.weight) onSave({ reps: checked[0].value, weight: checked[1].value, done: true });
  };

  return (
    <li className="grid gap-1.5">
      <div className="grid grid-cols-[2rem_1fr_1fr_2.75rem] items-start gap-2">
        <span id={labelId} className="grid min-h-11 place-items-center font-numbers text-2xl font-extrabold">
          <span className="sr-only">Set </span>
          {number}
        </span>
        <NumberField id={`${idPrefix}-reps`} labelledBy={`${headIds.reps} ${labelId}`} inputMode="numeric" value={reps} onChange={setReps} onBlur={save} invalid={Boolean(errors.reps)} describedBy={errorId} />
        <NumberField id={`${idPrefix}-weight`} labelledBy={`${headIds.weight} ${labelId}`} inputMode="decimal" value={weight} onChange={setWeight} onBlur={save} invalid={Boolean(errors.weight)} describedBy={errorId} />
        <button type="button" onClick={onRemove} aria-label={`Remove set ${number}`} className={`${recipe.focus} grid size-11 place-items-center font-display text-3xl font-bold hover-state:bg-bg`}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {(errors.reps || errors.weight) && (
        <div id={errorId} role="alert" className="grid gap-1 text-sm font-bold">
          {[errors.reps, errors.weight].filter(Boolean).map((message) => (
            <p key={message} className="flex gap-1.5">
              <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center bg-(--swatch-red) text-xs text-(--swatch-panel)">
                !
              </span>
              {message}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}

function StrengthCard({ store, workout }: { store: Store; workout: Workout }) {
  const recipe = useRecipe();
  const toast = useToast();
  const { update } = useStore();
  const entries = workout.entries.filter((entry) => entry.sets.some(isLogged));

  const saveSet = (exerciseId: string, index: number, set: SetRow) =>
    update((current) => {
      const sets = current.workouts.find((w) => w.id === workout.id)?.entries.find((e) => e.exerciseId === exerciseId)?.sets ?? [];
      return updateSets(current, workout.id, exerciseId, sets.map((existing, i) => (i === index ? set : existing)));
    });

  const removeSet = (exerciseId: string, index: number, number: number) => {
    const removed = workout.entries.find((e) => e.exerciseId === exerciseId)?.sets[index];
    update((current) => {
      const sets = current.workouts.find((w) => w.id === workout.id)?.entries.find((e) => e.exerciseId === exerciseId)?.sets ?? [];
      return updateSets(current, workout.id, exerciseId, sets.filter((_, i) => i !== index));
    });
    if (!removed) return;
    toast(`Removed set ${number}`, () =>
      update((current) => {
        const sets = current.workouts.find((w) => w.id === workout.id)?.entries.find((e) => e.exerciseId === exerciseId)?.sets ?? [];
        const at = Math.min(index, sets.length);
        return updateSets(current, workout.id, exerciseId, [...sets.slice(0, at), removed, ...sets.slice(at)]);
      }),
    );
  };

  return (
    <div className="grid gap-4">
      {entries.map((entry) => {
        const name = findExercise(store, entry.exerciseId)?.name ?? entry.exerciseId;
        const headIds = { reps: `${workout.id}-${entry.exerciseId}-reps`, weight: `${workout.id}-${entry.exerciseId}-weight` };
        // Number logged sets 1, 2, 3… but remember where each sits in the stored rows.
        const logged = entry.sets.map((set, index) => ({ set, index })).filter(({ set }) => isLogged(set));
        return (
          <section key={entry.exerciseId} aria-label={name} className="grid gap-2">
            <h3 className="font-display text-2xl font-extrabold uppercase leading-none">{name}</h3>
            <div className="grid grid-cols-[2rem_1fr_1fr_2.75rem] gap-2">
              <span className={recipe.fieldLabel}>Set</span>
              <span id={headIds.reps} className={recipe.fieldLabel}>
                Reps
              </span>
              <span id={headIds.weight} className={recipe.fieldLabel}>
                Weight (lb)
              </span>
            </div>
            <ol className="grid gap-2">
              {logged.map(({ set, index }, n) => (
                <LoggedSet
                  key={n}
                  idPrefix={`${workout.id}-${entry.exerciseId}-${index}`}
                  number={n + 1}
                  set={set}
                  headIds={headIds}
                  onSave={(next) => saveSet(entry.exerciseId, index, next)}
                  onRemove={() => removeSet(entry.exerciseId, index, n + 1)}
                />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function CardioCard({ workout }: { workout: Workout }) {
  const toast = useToast();
  const { update } = useStore();
  const [optionId, setOptionId] = useState<CardioOptionId>(workout.cardio?.optionId ?? "run");
  return (
    <div className="grid gap-3">
      <CardioPicker name={`cardio-${workout.id}`} value={optionId} onChange={setOptionId} />
      <Button
        variant="secondary"
        className="self-start"
        onClick={() => {
          update((current) => updateCardio(current, workout.id, { optionId }));
          toast(`Saved · ${CARDIO_OPTIONS.find((option) => option.id === optionId)?.label}`);
        }}
      >
        Save changes
      </Button>
    </div>
  );
}

function HistoryDay({ store, date }: { store: Store; date: string }) {
  const recipe = useRecipe();
  const toast = useToast();
  const { update } = useStore();
  const workouts = workoutsOn(store, date).filter(countsAsWorkout);
  const title = formatLong(date);

  if (!workouts.length) {
    return (
      <>
        <PageHeader back={BACK} title={title} />
        <StatePanel
          kind="empty"
          action={
            <Link href="/history" className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center`}>
              Back to History
            </Link>
          }
        >
          Nothing logged on this day.
        </StatePanel>
      </>
    );
  }

  const remove = (workout: Workout) => {
    const day = dayInfo(workout.dayId);
    let removed: ReturnType<typeof deleteWorkout>["removed"] = null;
    update((current) => {
      const result = deleteWorkout(current, workout.id);
      removed = result.removed;
      return result.store;
    });
    toast(`Deleted ${day?.name} workout`, () => {
      if (removed) {
        const toRestore = removed;
        update((current) => restoreWorkout(current, toRestore));
      }
    });
  };

  return (
    <>
      <PageHeader back={BACK} title={title} />
      {workouts.map((workout) => {
        const day = dayInfo(workout.dayId);
        return (
          <article key={workout.id} aria-label={`${day?.name} workout`} className={`${recipe.panel} grid gap-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={recipe.sectionTitle}>{day?.name}</h2>
              {day && <Badge tone={day.tone}>{TONE_LABELS[day.tone]}</Badge>}
            </div>
            {workout.cardio ? <CardioCard workout={workout} /> : <StrengthCard store={store} workout={workout} />}
            <Button variant="secondary" className="self-start" onClick={() => remove(workout)}>
              Delete workout
            </Button>
          </article>
        );
      })}
    </>
  );
}

export default function HistoryDayScreen({ date }: { date: string }) {
  const recipe = useRecipe();
  if (!parseDateKey(date)) {
    return (
      <>
        <PageHeader title="Date not found" />
        <StatePanel
          kind="error"
          action={
            <Link href="/history" className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center`}>
              Back to History
            </Link>
          }
        >
          That isn&apos;t a date we can show.
        </StatePanel>
      </>
    );
  }
  return <LoadGate>{({ store }) => <HistoryDay store={store} date={date} />}</LoadGate>;
}
