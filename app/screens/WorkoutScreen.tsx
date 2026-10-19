"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { exercisesForDay, extraExercises } from "@/lib/exercises";
import { CARDIO_OPTIONS, TARGET_REPS, TARGET_SETS, TONE_LABELS, dayInfo, type DayInfo } from "@/lib/routine";
import { exerciseProgress, lastSession, lastTimeLine, newBestCount, weekStrip, workoutSummary } from "@/lib/stats";
import { useStore } from "@/lib/store-client";
import type { CardioOptionId, Exercise, StrengthDayId, Store } from "@/lib/types";
import { MESSAGES } from "@/lib/validation";
import { countsAsWorkout, findWorkout, finishWorkout, saveCardio } from "@/lib/workouts";
import ExerciseRow from "../components/ExerciseRow";
import LoadGate from "../components/LoadGate";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/ToastProvider";
import WeekStrip from "../components/WeekStrip";
import Badge from "../design-system/components/Badge";
import Button from "../design-system/components/Button";
import StatePanel from "../design-system/components/StatePanel";
import { useRecipe } from "../design-system/RecipeContext";

const BACK_TO_TODAY = { href: "/", label: "Today" };

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="flex gap-1.5 text-sm font-bold">
      <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center bg-(--swatch-red) text-xs text-(--swatch-panel)">
        !
      </span>
      {message}
    </p>
  );
}

function StrengthDay({ store, today, day }: { store: Store; today: string; day: DayInfo }) {
  const recipe = useRecipe();
  const router = useRouter();
  const toast = useToast();
  const { update } = useStore();
  const [finishError, setFinishError] = useState(false);
  const dayId = day.id as StrengthDayId;
  const exercises = exercisesForDay(store, dayId);
  const extras = extraExercises(store);
  const workout = findWorkout(store, today, dayId);
  const total = exercises.length + extras.length;
  const doneCount = [...exercises, ...extras].filter((exercise) => {
    const { done, total: rows } = exerciseProgress(workout, exercise.id);
    return rows > 0 && done === rows;
  }).length;

  const row = (exercise: Exercise) => (
    <li key={exercise.id} className={recipe.rows.item}>
      <ExerciseRow
        href={`/workout/${dayId}/${exercise.id}`}
        name={exercise.name}
        lastLine={lastTimeLine(lastSession(store, exercise.id, today))}
        progress={exerciseProgress(workout, exercise.id)}
      />
    </li>
  );

  const finish = () => {
    if (!workout || !countsAsWorkout(workout)) {
      setFinishError(true);
      return;
    }
    const bests = newBestCount(store, workout);
    const saved = update((current) => finishWorkout(current, workout.id, new Date().toISOString()));
    const finished = saved.workouts.find((candidate) => candidate.id === workout.id) ?? workout;
    const bestText = bests === 0 ? "" : bests === 1 ? " · 1 new best" : ` · ${bests} new bests`;
    toast(`Workout saved · ${workoutSummary(saved, finished)}${bestText}`);
    router.push("/");
  };

  return (
    <>
      <PageHeader back={BACK_TO_TODAY} title={day.name} badge={<Badge tone={day.tone}>{TONE_LABELS[day.tone]}</Badge>} meta={`${total} exercises · ${TARGET_SETS} × ${TARGET_REPS}`} />
      {workout && (
        <p className="border-2 border-ink bg-surface p-3 font-bold">
          Continuing today&apos;s workout · {doneCount} of {total} done
        </p>
      )}
      <ul aria-label={`${day.name} exercises`} className={recipe.rows.list}>
        {exercises.map(row)}
      </ul>
      <section aria-labelledby="extras-heading" className="grid gap-3">
        <h2 id="extras-heading" className={recipe.label}>
          Extras
        </h2>
        {extras.length ? (
          <ul aria-label="Extra exercises" className={recipe.rows.list}>
            {extras.map(row)}
          </ul>
        ) : (
          <p className="font-bold text-muted">No extras yet.</p>
        )}
        <Link
          href={`/exercises/new?day=${dayId}&returnTo=${encodeURIComponent(`/workout/${dayId}`)}`}
          className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center self-start`}
        >
          + Add an exercise
        </Link>
      </section>
      <div className="grid gap-2">
        <Button onClick={finish} aria-describedby={finishError ? "finish-error" : undefined}>
          Finish workout
        </Button>
        {finishError && <FieldError id="finish-error" message={MESSAGES.finishEmpty} />}
      </div>
    </>
  );
}

function CardioDay({ store, today, day }: { store: Store; today: string; day: DayInfo }) {
  const recipe = useRecipe();
  const router = useRouter();
  const toast = useToast();
  const { update } = useStore();
  const saved = findWorkout(store, today, "cardio")?.cardio;
  const [optionId, setOptionId] = useState<CardioOptionId | null>(saved?.optionId ?? null);
  const [optionError, setOptionError] = useState(false);
  const firstOption = useRef<HTMLInputElement>(null);

  const choose = (id: CardioOptionId) => {
    setOptionId(id);
    setOptionError(false);
  };

  const save = () => {
    if (!optionId) {
      setOptionError(true);
      firstOption.current?.focus();
      return;
    }
    const option = CARDIO_OPTIONS.find((candidate) => candidate.id === optionId);
    update((current) => saveCardio(current, { date: today, optionId, newId: () => crypto.randomUUID(), nowIso: new Date().toISOString() }));
    toast(`Cardio saved · ${option?.label}`);
    router.push("/");
  };

  return (
    <>
      <PageHeader back={BACK_TO_TODAY} title={day.name} badge={<Badge tone="cardio">{TONE_LABELS.cardio}</Badge>} meta="Pick one" />
      <fieldset aria-describedby={optionError ? "cardio-error" : undefined} className="grid gap-3">
        <legend className={`${recipe.fieldLabel} mb-2`}>Which cardio did you do?</legend>
        {CARDIO_OPTIONS.map((option, index) => (
          <label
            key={option.id}
            htmlFor={`cardio-${option.id}`}
            className={`${recipe.card.root} flex cursor-pointer items-start gap-3 p-4 has-checked:bg-accent has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus`}
          >
            <input
              ref={index === 0 ? firstOption : undefined}
              id={`cardio-${option.id}`}
              type="radio"
              name="cardio"
              value={option.id}
              checked={optionId === option.id}
              onChange={() => choose(option.id)}
              className={`${recipe.radio} mt-1 outline-none`}
            />
            <span className="grid gap-1">
              <span className={recipe.card.title}>{option.label}</span>
              <span className="font-bold">{option.detail}</span>
            </span>
          </label>
        ))}
        {optionError && <FieldError id="cardio-error" message={MESSAGES.cardioOption} />}
      </fieldset>
      <Button onClick={save}>Save cardio</Button>
    </>
  );
}

function RestDay({ store, today, day }: { store: Store; today: string; day: DayInfo }) {
  const recipe = useRecipe();
  return (
    <>
      <PageHeader back={BACK_TO_TODAY} title={day.name} badge={<Badge tone="rest">{TONE_LABELS.rest}</Badge>} />
      <StatePanel kind="empty">Rest day: nothing to log. Enjoy it.</StatePanel>
      <section aria-labelledby="week-heading" className={`${recipe.panel} grid gap-3`}>
        <h2 id="week-heading" className={recipe.label}>
          This week
        </h2>
        <WeekStrip days={weekStrip(store, today)} />
      </section>
      <Link href="/history" className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center self-start`}>
        See your history
      </Link>
    </>
  );
}

export default function WorkoutScreen({ dayId }: { dayId: string }) {
  const { today } = useStore();
  const recipe = useRecipe();
  const day = dayInfo(dayId);
  if (!day) {
    return (
      <>
        <PageHeader title="Day not found" />
        <StatePanel
          kind="error"
          action={
            <Link href="/" className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center`}>
              Back to Today
            </Link>
          }
        >
          That day isn&apos;t in your routine.
        </StatePanel>
      </>
    );
  }
  return (
    <LoadGate>
      {({ store }) => {
        const props = { store, today: today(), day };
        if (day.kind === "cardio") return <CardioDay {...props} />;
        if (day.kind === "rest") return <RestDay {...props} />;
        return <StrengthDay {...props} />;
      }}
    </LoadGate>
  );
}
