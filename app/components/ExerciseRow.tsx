"use client";

import Link from "next/link";
import Badge from "../design-system/components/Badge";
import { useRecipe } from "../design-system/RecipeContext";

type ExerciseRowProps = {
  href: string;
  name: string;
  lastLine: string;
  progress: { done: number; total: number };
};

export default function ExerciseRow({ href, name, lastLine, progress }: ExerciseRowProps) {
  const recipe = useRecipe();
  const allDone = progress.total > 0 && progress.done === progress.total;
  return (
    <Link href={href} className={`${recipe.rows.row} ${recipe.focus} min-h-14 focus-state:-outline-offset-5`}>
      <span className="grid min-w-0 gap-0.5">
        <span className="break-words">{name}</span>
        <span className="text-sm font-bold text-muted">{lastLine}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {allDone ? (
          <Badge tone="done">Done</Badge>
        ) : progress.total > 0 ? (
          <span className={recipe.rows.sets}>
            {progress.done}/{progress.total} <span className="font-body text-sm">sets</span>
          </span>
        ) : null}
        <span aria-hidden="true" className="font-display text-2xl">
          ›
        </span>
      </span>
    </Link>
  );
}
