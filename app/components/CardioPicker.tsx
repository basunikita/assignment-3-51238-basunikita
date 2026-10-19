"use client";

import type { Ref } from "react";
import { CARDIO_OPTIONS } from "@/lib/routine";
import type { CardioOptionId } from "@/lib/types";
import { useRecipe } from "../design-system/RecipeContext";

type CardioPickerProps = {
  // Unique per page, so two pickers (two cardio workouts in History) don't share radio names.
  name: string;
  value: CardioOptionId | null;
  onChange: (id: CardioOptionId) => void;
  error?: string;
  firstOptionRef?: Ref<HTMLInputElement>;
};

// Nikita's four cardio options as cards with their steps, used on the workout page and in History.
export default function CardioPicker({ name, value, onChange, error, firstOptionRef }: CardioPickerProps) {
  const recipe = useRecipe();
  const errorId = `${name}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="grid gap-3">
      <legend className={`${recipe.fieldLabel} mb-2`}>Which cardio did you do?</legend>
      {CARDIO_OPTIONS.map((option, index) => (
        <label
          key={option.id}
          htmlFor={`${name}-${option.id}`}
          className={`${recipe.card.root} flex cursor-pointer items-start gap-3 p-4 has-checked:bg-accent has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus`}
        >
          <input
            ref={index === 0 ? firstOptionRef : undefined}
            id={`${name}-${option.id}`}
            type="radio"
            name={name}
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
            className={`${recipe.radio} mt-1 outline-none`}
          />
          <span className="grid gap-1">
            <span className={recipe.card.title}>{option.label}</span>
            <span className="font-bold">{option.detail}</span>
          </span>
        </label>
      ))}
      {error && (
        <p id={errorId} role="alert" className="flex gap-1.5 text-sm font-bold">
          <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center bg-(--swatch-red) text-xs text-(--swatch-panel)">
            !
          </span>
          {error}
        </p>
      )}
    </fieldset>
  );
}
