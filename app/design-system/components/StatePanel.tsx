"use client";

import type { ReactNode } from "react";
import { useRecipe } from "../RecipeContext";

export type UiState = "empty" | "loading" | "error" | "success";

function StateIcon({ kind, className }: { kind: UiState; className: string }) {
  if (kind === "empty") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
        <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    );
  }
  if (kind === "loading") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" className={`${className} motion-safe:animate-spin`}>
        <path d="M16 4a12 12 0 1 1-12 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "error") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
        <circle cx="16" cy="16" r="13" fill="currentColor" />
        <path d="M16 9v9" strokeWidth="3" strokeLinecap="round" className="stroke-bg" />
        <circle cx="16" cy="23" r="1.8" className="fill-bg" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="13" fill="currentColor" />
      <path d="M10 16.5 14 20.5 22 11.5" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-bg" />
    </svg>
  );
}

type StatePanelProps = { kind: UiState; children: ReactNode; action?: ReactNode };

export default function StatePanel({ kind, children, action }: StatePanelProps) {
  const recipe = useRecipe();
  return (
    <div role={kind === "error" ? "alert" : "status"} data-ui-state={kind} className={recipe.uiState.root}>
      <StateIcon kind={kind} className={recipe.uiState.icon} />
      <p className={recipe.uiState.text}>{children}</p>
      {action}
    </div>
  );
}
