"use client";

import type { ButtonHTMLAttributes, Ref } from "react";
import type { FrozenState } from "../recipe";
import { useRecipe } from "../RecipeContext";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  // A frozen hover, focus or press for the control-states grid.
  state?: FrozenState;
  ref?: Ref<HTMLButtonElement>;
};

export default function Button({ variant = "primary", state, ref, className = "", type = "button", ...props }: ButtonProps) {
  const recipe = useRecipe();
  return (
    <button
      ref={ref}
      type={type}
      data-state={state}
      className={`${recipe.button.base} ${recipe.button[variant]} ${recipe.focus} ${className}`}
      {...props}
    />
  );
}
