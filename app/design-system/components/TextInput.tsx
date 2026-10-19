"use client";

import type { InputHTMLAttributes, Ref } from "react";
import type { FrozenState } from "../recipe";
import { useRecipe } from "../RecipeContext";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  state?: FrozenState;
  // Shown under the field and tied to it, so screen readers read it with the field.
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

export default function TextInput({ id, label, state, error, ref, className = "", ...props }: TextInputProps) {
  const recipe = useRecipe();
  const errorId = `${id}-error`;
  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label htmlFor={id} className={recipe.fieldLabel}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        data-state={state}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${recipe.field} ${recipe.focus} min-h-11 aria-invalid:border-[3px] aria-invalid:border-(--swatch-red)`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="flex gap-1.5 text-sm font-bold">
          <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center bg-(--swatch-red) text-xs text-(--swatch-panel)">
            !
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
