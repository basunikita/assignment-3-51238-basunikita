"use client";

import type { Ref } from "react";
import type { RowDraft } from "@/lib/set-rows";
import { useRecipe } from "../design-system/RecipeContext";
import NumberField from "./NumberField";

export type RowErrors = { reps?: string; weight?: string };

// Column template shared by the header row and every set row.
export const SET_GRID = "grid grid-cols-[2rem_1fr_1fr_3rem_2.75rem] items-start gap-2";

type SetRowEditorProps = {
  index: number;
  row: RowDraft;
  errors: RowErrors;
  repsHeadId: string;
  weightHeadId: string;
  repsRef?: Ref<HTMLInputElement>;
  weightRef?: Ref<HTMLInputElement>;
  onChange: (field: "reps" | "weight", value: string) => void;
  onBlur: () => void;
  onTick: () => void;
  onRemove?: () => void;
};

export default function SetRowEditor({ index, row, errors, repsHeadId, weightHeadId, repsRef, weightRef, onChange, onBlur, onTick, onRemove }: SetRowEditorProps) {
  const recipe = useRecipe();
  const number = index + 1;
  const labelId = `set-${number}-label`;
  const errorId = `set-${number}-error`;
  const hasError = Boolean(errors.reps || errors.weight);
  return (
    <li className={`grid gap-2 border-2 border-ink p-2 ${row.done ? "bg-accent" : "bg-surface"}`}>
      <div className={SET_GRID}>
        <span id={labelId} className="grid min-h-11 place-items-center font-numbers text-2xl font-extrabold">
          <span className="sr-only">Set </span>
          {number}
        </span>
        <NumberField
          ref={repsRef}
          id={`set-${number}-reps`}
          labelledBy={`${repsHeadId} ${labelId}`}
          inputMode="numeric"
          value={row.reps}
          invalid={Boolean(errors.reps)}
          describedBy={errorId}
          onChange={(value) => onChange("reps", value)}
          onBlur={onBlur}
        />
        <NumberField
          ref={weightRef}
          id={`set-${number}-weight`}
          labelledBy={`${weightHeadId} ${labelId}`}
          inputMode="decimal"
          value={row.weight}
          invalid={Boolean(errors.weight)}
          describedBy={errorId}
          onChange={(value) => onChange("weight", value)}
          onBlur={onBlur}
        />
        <button
          type="button"
          onClick={onTick}
          aria-pressed={row.done}
          aria-label={row.done ? `Untick set ${number}` : `Save set ${number}`}
          className={`${recipe.focus} grid size-12 place-items-center border-2 border-ink font-display text-3xl font-black shadow-[2px_2px_0_var(--swatch-ink)] transition-[translate,box-shadow,background-color] pressed-state:translate-x-0.5 pressed-state:translate-y-0.5 pressed-state:shadow-none ${row.done ? "bg-ink text-(--swatch-panel)" : "bg-(--swatch-panel) text-ink hover-state:bg-bg"}`}
        >
          <span aria-hidden="true">✓</span>
        </button>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove set ${number}`}
            className={`${recipe.focus} grid size-11 place-items-center font-display text-3xl font-bold leading-none hover-state:bg-bg`}
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : (
          <span />
        )}
      </div>
      {hasError && (
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
