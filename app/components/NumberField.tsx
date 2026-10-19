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
  inputMode: "numeric" | "decimal";
  suffix?: string;
  ref?: Ref<HTMLInputElement>;
  className?: string;
};

// A text input for numbers (type="number" drops what people type when it isn't a number, so the
// error message couldn't quote their input back). Errors sit under the field and are tied to it.
export default function NumberField({ id, label, labelledBy, value, onChange, onBlur, error, inputMode, suffix, ref, className = "" }: NumberFieldProps) {
  const recipe = useRecipe();
  const errorId = `${id}-error`;
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
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={`${recipe.field} ${recipe.focus} min-h-11 min-w-0 font-numbers text-2xl font-extrabold aria-invalid:border-(--swatch-red) aria-invalid:border-[3px]`}
        />
        {suffix && <span className="font-bold text-muted">{suffix}</span>}
      </div>
      {error && (
        <p id={errorId} role="alert" className="flex gap-1.5 text-sm font-bold text-ink">
          <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center bg-(--swatch-red) text-xs text-(--swatch-panel)">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
