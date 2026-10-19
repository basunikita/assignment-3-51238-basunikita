"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Recipe } from "./recipe";

const RecipeContext = createContext<Recipe | null>(null);

export function RecipeProvider({ recipe, children }: { recipe: Recipe; children: ReactNode }) {
  return <RecipeContext value={recipe}>{children}</RecipeContext>;
}

export function useRecipe(): Recipe {
  const recipe = useContext(RecipeContext);
  if (!recipe) throw new Error("useRecipe must be used inside a RecipeProvider");
  return recipe;
}
