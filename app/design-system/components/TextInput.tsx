"use client";

import type { InputHTMLAttributes } from "react";
import type { FrozenState } from "../recipe";
import { useRecipe } from "../RecipeContext";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; state?: FrozenState };

export default function TextInput({ id, label, state, className = "", ...props }: TextInputProps) {
  const recipe = useRecipe();
  return (
    <div className={`grid gap-1.5 ${className}`}>
      <label htmlFor={id} className={recipe.fieldLabel}>
        {label}
      </label>
      <input id={id} data-state={state} className={`${recipe.field} ${recipe.focus}`} {...props} />
    </div>
  );
}
