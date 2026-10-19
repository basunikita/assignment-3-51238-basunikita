"use client";

import Link from "next/link";
import { formatLong, formatMonth, monthGrid } from "@/lib/dates";
import type { Tone } from "@/lib/types";
import { useRecipe } from "../design-system/RecipeContext";
import { TONE_FILL } from "./toneStyles";

type MonthCalendarProps = {
  month: string;
  // Each date with workouts: their tones and day names, in order.
  workoutsByDate: Map<string, { tones: Tone[]; names: string[] }>;
  today: string;
  onMonthChange: (step: -1 | 1) => void;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function MonthCalendar({ month, workoutsByDate, today, onMonthChange }: MonthCalendarProps) {
  const recipe = useRecipe();
  const navButton = `${recipe.focus} grid size-11 place-items-center border-2 border-ink bg-surface font-display text-2xl font-black hover-state:bg-bg`;
  return (
    <section aria-labelledby="calendar-heading" className={`${recipe.panel} grid gap-3`}>
      <div className="flex items-center justify-between gap-2">
        <button type="button" className={navButton} onClick={() => onMonthChange(-1)} aria-label="Previous month">
          <span aria-hidden="true">‹</span>
        </button>
        <h2 id="calendar-heading" className="font-display text-2xl font-extrabold uppercase" aria-live="polite">
          {formatMonth(month)}
        </h2>
        <button type="button" className={navButton} onClick={() => onMonthChange(1)} aria-label="Next month">
          <span aria-hidden="true">›</span>
        </button>
      </div>
      <div aria-hidden="true" className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((letter, i) => (
          <span key={i} className={recipe.label}>
            {letter}
          </span>
        ))}
      </div>
      <ul className="grid grid-cols-7 gap-1">
        {monthGrid(month).map((date, i) => {
          if (!date) return <li key={`blank-${i}`} aria-hidden="true" />;
          const logged = workoutsByDate.get(date);
          const dayNumber = Number(date.slice(8));
          const ring = date === today ? "outline-3 outline-offset-1 outline-ink" : "";
          if (!logged) {
            return (
              <li key={date} className={`grid aspect-square place-items-center font-numbers text-lg text-muted ${ring}`}>
                <span aria-hidden="true">{dayNumber}</span>
                <span className="sr-only">{formatLong(date)}: nothing logged</span>
              </li>
            );
          }
          const [first, second] = logged.tones;
          return (
            <li key={date} className={ring}>
              <Link
                href={`/history/${date}`}
                aria-label={`${formatLong(date)}: ${logged.names.join(" and ")}`}
                className={`${recipe.focus} relative grid aspect-square place-items-center overflow-hidden border-2 border-ink font-numbers text-lg font-extrabold`}
              >
                <span aria-hidden="true" className={`absolute inset-0 ${TONE_FILL[first]}`} />
                {second && <span aria-hidden="true" className={`absolute inset-y-0 right-0 w-1/2 border-l-2 border-ink ${TONE_FILL[second]}`} />}
                <span aria-hidden="true" className="relative text-(--swatch-panel)">
                  {dayNumber}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
