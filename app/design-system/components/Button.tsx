"use client";

import type { ButtonHTMLAttributes } from "react";
import type { FrozenState } from "../recipe";
import { useRecipe } from "../RecipeContext";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  // A frozen hover, focus or press for the control-states grid.
  state?: FrozenState;
};

export default function Button({ variant = "primary", state, className = "", type = "button", ...props }: ButtonProps) {
  const recipe = useRecipe();
  return (
    <button
      type={type}
      data-state={state}
      className={`${recipe.button.base} ${recipe.button[variant]} ${recipe.focus} ${className}`}
      {...props}
    />
  );
}
