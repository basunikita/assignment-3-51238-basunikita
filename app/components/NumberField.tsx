"use client";

import type { Ref } from "react";
import { useRecipe } from "../design-system/RecipeContext";

type NumberFieldProps = {
  id: string;
  // A visible label, or the id of visible text that labels it (the set table's column headers).
  label?: string;
  labelledBy?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  // For errors shown outside the field (the set table shows one message under the whole row).
  invalid?: boolean;
  describedBy?: string;
  inputMode: "numeric" | "decimal";
  suffix?: string;
  ref?: Ref<HTMLInputElement>;
  className?: string;
};

// A text input for numbers (type="number" drops what people type when it isn't a number, so the
// error message couldn't quote their input back). Errors sit under the field and are tied to it.
export default function NumberField({ id, label, labelledBy, value, onChange, onBlur, error, invalid, describedBy, inputMode, suffix, ref, className = "" }: NumberFieldProps) {
  const recipe = useRecipe();
  const errorId = error ? `${id}-error` : describedBy;
  const isInvalid = Boolean(error) || invalid;
  return (
    <div className={`grid content-start gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className={recipe.fieldLabel}>
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          aria-labelledby={label ? undefined : labelledBy}
          aria-invalid={isInvalid ? true : undefined}
          aria-describedby={isInvalid ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={`${recipe.field} ${recipe.focus} min-h-11 min-w-0 font-numbers text-2xl font-extrabold aria-invalid:border-(--swatch-red) aria-invalid:border-[3px]`}
        />
        {suffix && <span className="font-bold text-muted">{suffix}</span>}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="flex gap-1.5 text-sm font-bold text-ink">
          <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center bg-(--swatch-red) text-xs text-(--swatch-panel)">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
