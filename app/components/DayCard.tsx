"use client";

import Link from "next/link";
import { TONE_LABELS, type DayInfo } from "@/lib/routine";
import Badge from "../design-system/components/Badge";
import { useRecipe } from "../design-system/RecipeContext";
import { TONE_BAR } from "./toneStyles";

type DayCardProps = {
  day: DayInfo;
  meta: string;
  lastDone?: string;
  href: string;
};

export default function DayCard({ day, meta, lastDone, href }: DayCardProps) {
  const recipe = useRecipe();
  return (
    <Link
      href={href}
      className={`${recipe.card.root} ${recipe.focus} flex min-h-11 transition-[translate,box-shadow] pressed-state:translate-x-0.5 pressed-state:translate-y-0.5 pressed-state:shadow-none hover-state:bg-bg`}
    >
      <span aria-hidden="true" className={`w-3 shrink-0 border-r-2 border-ink ${TONE_BAR[day.tone]}`} />
      <span className="grid flex-1 gap-1.5 p-4">
        <span className="flex items-start justify-between gap-3">
          <span className={recipe.card.title}>{day.name}</span>
          <span className="shrink-0 font-display text-3xl leading-none" aria-hidden="true">
            ›
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={day.tone}>{TONE_LABELS[day.tone]}</Badge>
          <span className="font-bold">{meta}</span>
        </span>
        {lastDone && <span className="text-sm font-bold text-muted">{lastDone}</span>}
      </span>
    </Link>
  );
}
