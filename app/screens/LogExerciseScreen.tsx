"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { formatShort } from "@/lib/dates";
import { findExercise } from "@/lib/exercises";
import { TONE_LABELS, dayInfo, type DayInfo } from "@/lib/routine";
import { chartSummary, formatSets, lastSession, maxWeightSeries, newBest, prefillRows } from "@/lib/stats";
import { useStore } from "@/lib/store-client";
import type { Exercise, SetRow, Settings, StrengthDayId, Store } from "@/lib/types";
import { checkReps, checkWeight } from "@/lib/validation";
import { findWorkout, saveEntry } from "@/lib/workouts";
import Banner from "../components/Banner";
import LoadGate from "../components/LoadGate";
import MaxWeightChart from "../components/MaxWeightChart";
import PageHeader from "../components/PageHeader";
import SetRowEditor, { SET_GRID, type RowDraft, type RowErrors } from "../components/SetRowEditor";
import { useToast } from "../components/ToastProvider";
import Badge from "../design-system/components/Badge";
import RadioGroup from "../design-system/components/RadioGroup";
import RestTimer from "../design-system/components/RestTimer";
import StatePanel from "../design-system/components/StatePanel";
import { useRecipe } from "../design-system/RecipeContext";

const REST_CHOICES = [
  { value: "60", label: "60 s" },
  { value: "90", label: "90 s" },
  { value: "120", label: "2 min" },
];

const toDraft = (set: SetRow): RowDraft => ({
  reps: set.reps === null ? "" : String(set.reps),
  weight: set.weight === null ? "" : String(set.weight),
  done: set.done,
});

// Invalid or empty fields are saved as null; a row only stays done with real numbers.
const toSetRow = (row: RowDraft): SetRow => {
  const reps = checkReps(row.reps).value;
  const weight = checkWeight(row.weight).value;
  return { reps, weight, done: row.done && reps !== null && weight !== null };
};

function checkRow(row: RowDraft): RowErrors {
  const errors: RowErrors = {};
  const reps = checkReps(row.reps);
  const weight = checkWeight(row.weight);
  if (reps.error) errors.reps = reps.error;
  if (weight.error) errors.weight = weight.error;
  return errors;
}

function LogExercise({ store, startToday, day, exercise }: { store: Store; startToday: string; day: DayInfo; exercise: Exercise }) {
  const recipe = useRecipe();
  const toast = useToast();
  const { update, today } = useStore();
  const dayId = day.id as StrengthDayId;
  const last = lastSession(store, exercise.id, startToday);

  const [rows, setRows] = useState<RowDraft[]>(() => {
    const saved = findWorkout(store, startToday, dayId)?.entries.find((entry) => entry.exerciseId === exercise.id);
    return (saved?.sets ?? prefillRows(last)).map(toDraft);
  });
  const [touched, setTouched] = useState<boolean[]>(() => rows.map(() => false));
  const [errors, setErrors] = useState<RowErrors[]>(() => rows.map(() => ({})));
  const [bestMessage, setBestMessage] = useState<string | null>(null);
  const [timerStarts, setTimerStarts] = useState(0);
  const repsRefs = useRef<(HTMLInputElement | null)[]>([]);
  const weightRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Mirrors of the latest state, for Undo callbacks that run after later changes.
  const rowsRef = useRef(rows);
  const touchedRef = useRef(touched);
  const errorsRef = useRef(errors);

  const persist = (next: RowDraft[]) => {
    update((current) => saveEntry(current, { date: today(), dayId, exerciseId: exercise.id, sets: next.map(toSetRow), newId: () => crypto.randomUUID() }));
  };

  // Every change goes through here so the latest rows are available to Undo.
  const commit = (next: RowDraft[], nextTouched = touched, nextErrors = errors, save = true) => {
    rowsRef.current = next;
    touchedRef.current = nextTouched;
    errorsRef.current = nextErrors;
    setRows(next);
    setTouched(nextTouched);
    setErrors(nextErrors);
    if (save) persist(next);
  };

  const change = (index: number, field: "reps" | "weight", value: string) => {
    const next = rows.map((row) => ({ ...row }));
    next[index][field] = value;
    const nextTouched = touched.map((was, i) => was || i === index);
    // Typing reps in set 1 fills the sets below that haven't been touched yet.
    if (index === 0 && field === "reps") {
      next.forEach((row, i) => {
        if (i > 0 && !touched[i] && !row.done) row.reps = value;
      });
    }
    const nextErrors = errors.map((rowErrors, i) => (i === index ? { ...rowErrors, [field]: undefined } : rowErrors));
    // A ticked row is re-checked and saved when the field loses focus.
    commit(next, nextTouched, nextErrors, !rows[index].done);
  };

  const blur = (index: number) => {
    const row = rowsRef.current[index];
    if (!row?.done) return;
    const rowErrors = checkRow(row);
    const nextErrors = errors.map((existing, i) => (i === index ? rowErrors : existing));
    if (rowErrors.reps || rowErrors.weight) setErrors(nextErrors);
    else commit(rowsRef.current, touched, nextErrors);
  };

  const tick = (index: number) => {
    const row = rows[index];
    if (row.done) {
      commit(rows.map((r, i) => (i === index ? { ...r, done: false } : r)));
      return;
    }
    const rowErrors = checkRow(row);
    const nextErrors = errors.map((existing, i) => (i === index ? rowErrors : existing));
    if (rowErrors.reps || rowErrors.weight) {
      setErrors(nextErrors);
      (rowErrors.reps ? repsRefs : weightRefs).current[index]?.focus();
      return;
    }
    const reps = checkReps(row.reps).value as number;
    const weight = checkWeight(row.weight).value as number;
    commit(
      rows.map((r, i) => (i === index ? { reps: String(reps), weight: String(weight), done: true } : r)),
      touched,
      nextErrors,
    );
    setTimerStarts((count) => count + 1);
    const best = newBest(store, exercise.id, today(), weight);
    if (best) setBestMessage(`New best: ${weight} lb (was ${best.previous} lb)`);
  };

  const addSet = () => {
    const above = rows[rows.length - 1];
    commit([...rows, { reps: above.reps, weight: above.weight, done: false }], [...touched, false], [...errors, {}]);
  };

  const removeSet = (index: number) => {
    const removed = rows[index];
    commit(
      rows.filter((_, i) => i !== index),
      touched.filter((_, i) => i !== index),
      errors.filter((_, i) => i !== index),
    );
    toast(`Removed set ${index + 1}`, () => {
      const [current, currentTouched, currentErrors] = [rowsRef.current, touchedRef.current, errorsRef.current];
      const at = Math.min(index, current.length);
      commit(
        [...current.slice(0, at), removed, ...current.slice(at)],
        [...currentTouched.slice(0, at), false, ...currentTouched.slice(at)],
        [...currentErrors.slice(0, at), {}, ...currentErrors.slice(at)],
      );
    });
  };

  const setRest = (value: string) => {
    update((current) => ({ ...current, settings: { restSeconds: Number(value) as Settings["restSeconds"] } }));
  };

  const series = maxWeightSeries(store, exercise.id);
  const badge = exercise.dayId === "extra" ? <Badge tone="rest">Any day</Badge> : <Badge tone={day.tone}>{TONE_LABELS[day.tone]}</Badge>;

  return (
    <>
      <PageHeader back={{ href: `/workout/${dayId}`, label: day.name }} title={exercise.name} badge={badge} />

      <section aria-label="Last time" className="grid gap-2">
        {last ? (
          <p className="text-lg font-bold">
            Last time · {formatShort(last.date)}: {formatSets(last.sets)}
          </p>
        ) : (
          <p className="text-lg font-bold">First time. Pick a weight you can lift 10 times.</p>
        )}
      </section>

      {bestMessage && <Banner tone="success">{bestMessage}</Banner>}

      <section aria-labelledby="sets-heading" className="grid gap-2">
        <h2 id="sets-heading" className="sr-only">
          Sets
        </h2>
        <div className={`${SET_GRID} px-2`}>
          <span className={recipe.fieldLabel}>Set</span>
          <span id="reps-head" className={recipe.fieldLabel}>
            Reps
          </span>
          <span id="weight-head" className={recipe.fieldLabel}>
            Weight (lb)
          </span>
        </div>
        <ol className="grid gap-2">
          {rows.map((row, index) => (
            <SetRowEditor
              key={index}
              index={index}
              row={row}
              errors={errors[index] ?? {}}
              repsHeadId="reps-head"
              weightHeadId="weight-head"
              repsRef={(el) => {
                repsRefs.current[index] = el;
              }}
              weightRef={(el) => {
                weightRefs.current[index] = el;
              }}
              onChange={(field, value) => change(index, field, value)}
              onBlur={() => blur(index)}
              onTick={() => tick(index)}
              onRemove={index > 0 ? () => removeSet(index) : undefined}
            />
          ))}
        </ol>
        <button type="button" onClick={addSet} className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center self-start`}>
          + Add set
        </button>
      </section>

      <section aria-label="Rest timer" className="grid gap-3">
        <RadioGroup name="rest" legend="Rest between sets" options={REST_CHOICES} value={String(store.settings.restSeconds)} onChange={setRest} />
        {timerStarts > 0 && (
          <div className="sticky bottom-[4.5rem] z-10">
            <RestTimer key={`${store.settings.restSeconds}-${timerStarts}`} seconds={store.settings.restSeconds} autoStart compact />
          </div>
        )}
      </section>

      <section aria-labelledby="progress-heading" className="grid gap-2">
        <h2 id="progress-heading" className={recipe.label}>
          Max weight
        </h2>
        {series.length ? <MaxWeightChart series={series} summary={chartSummary(exercise.name, series)} /> : <p className="font-bold text-muted">Tick a set to start your chart.</p>}
      </section>

      <Link href={`/workout/${dayId}`} className={`${recipe.button.base} ${recipe.button.secondary} ${recipe.focus}`}>
        Done with this exercise
      </Link>
    </>
  );
}

export default function LogExerciseScreen({ dayId, exerciseId }: { dayId: string; exerciseId: string }) {
  const recipe = useRecipe();
  const { today } = useStore();
  const day = dayInfo(dayId);
  return (
    <LoadGate>
      {({ store }) => {
        const exercise = findExercise(store, exerciseId);
        const fitsDay = exercise && day?.kind === "strength" && (exercise.dayId === day.id || exercise.dayId === "extra");
        if (!exercise || !day || !fitsDay) {
          return (
            <>
              <PageHeader title="Exercise not found" />
              <StatePanel
                kind="error"
                action={
                  <Link href={day?.kind === "strength" ? `/workout/${day.id}` : "/"} className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center`}>
                    {day?.kind === "strength" ? `Back to ${day.name}` : "Back to Today"}
                  </Link>
                }
              >
                We couldn&apos;t find that exercise.
              </StatePanel>
            </>
          );
        }
        return <LogExercise key={`${dayId}-${exerciseId}`} store={store} startToday={today()} day={day} exercise={exercise} />;
      }}
    </LoadGate>
  );
}
