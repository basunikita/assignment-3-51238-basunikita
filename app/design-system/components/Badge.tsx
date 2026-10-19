"use client";

import type { ReactNode } from "react";
import type { BadgeTone } from "../recipe";
import { useRecipe } from "../RecipeContext";

export default function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  const recipe = useRecipe();
  return <span className={`${recipe.badge.base} ${recipe.badge.tones[tone]}`}>{children}</span>;
}
