"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { addExercise } from "@/lib/exercises";
import { useStore } from "@/lib/store-client";
import type { Exercise, StrengthDayId, Store } from "@/lib/types";
import { checkExerciseForm } from "@/lib/validation";
import LoadGate from "../components/LoadGate";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/ToastProvider";
import Button from "../design-system/components/Button";
import RadioGroup from "../design-system/components/RadioGroup";
import TextInput from "../design-system/components/TextInput";

const DAY_CHOICES = [
  { value: "back-biceps", label: "Back and biceps" },
  { value: "shoulders-triceps", label: "Shoulders and triceps" },
  { value: "legs", label: "Legs" },
  { value: "extra", label: "Any day (extra)" },
];

type Props = { initialDay: StrengthDayId | null; returnTo: string | null };

function NewExercise({ store, initialDay, returnTo }: Props & { store: Store }) {
  const router = useRouter();
  const toast = useToast();
  const { update } = useStore();
  const [name, setName] = useState("");
  const [dayId, setDayId] = useState<string | null>(initialDay);
  const [tried, setTried] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  // After the first failed try, errors update as she types or picks.
  const errors = tried ? checkExerciseForm(store, { name, dayId }) : {};

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = checkExerciseForm(store, { name, dayId });
    if (found.name || found.day) {
      setTried(true);
      if (found.name) nameInput.current?.focus();
      else document.getElementById(`exercise-day-${DAY_CHOICES[0].value}`)?.focus();
      return;
    }
    let added: Exercise | null = null;
    update((current) => {
      const result = addExercise(current, { name, dayId: dayId as StrengthDayId | "extra" });
      added = result.exercise;
      return result.store;
    });
    const exercise = added as Exercise | null;
    if (!exercise) return;
    toast(`Added ${exercise.name}`);
    router.push(returnTo ?? `/exercises/${exercise.id}`);
  };

  return (
    <>
      <PageHeader back={returnTo ? { href: returnTo, label: "Back to workout" } : { href: "/exercises", label: "Exercises" }} title="Add exercise" />
      <form noValidate onSubmit={submit} className="grid gap-5">
        <TextInput
          ref={nameInput}
          id="exercise-name"
          label="Exercise name"
          autoComplete="off"
          value={name}
          error={errors.name}
          onChange={(event) => setName(event.target.value)}
        />
        <RadioGroup name="exercise-day" legend="Which day?" options={DAY_CHOICES} value={dayId} onChange={setDayId} error={errors.day} stacked />
        <Button type="submit">Add exercise</Button>
      </form>
    </>
  );
}

export default function NewExerciseScreen(props: Props) {
  return <LoadGate>{({ store }) => <NewExercise store={store} {...props} />}</LoadGate>;
}
