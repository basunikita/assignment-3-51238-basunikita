"use client";

import { useEffect, useState } from "react";
import { useRecipe } from "../RecipeContext";
import { formatSeconds, isRunning, newTimer, resetTimer, tick, toggleRunning, type TimerState } from "../timer";
import Button from "./Button";

// Checks the clock several times a second; tick() only changes state when the shown second does.
const CLOCK_CHECK_MS = 250;

type RestTimerProps = {
  seconds: number;
  // Start counting down as soon as it mounts (after a set is ticked).
  autoStart?: boolean;
  // One short row, for docking at the bottom of the screen.
  compact?: boolean;
};

function startingState(seconds: number, autoStart: boolean): TimerState {
  const timer = newTimer(seconds);
  return autoStart ? toggleRunning(timer, Date.now()) : timer;
}

// To restart it (a new set ticked, or a new length), the parent changes its key.
export default function RestTimer({ seconds, autoStart = false, compact = false }: RestTimerProps) {
  const recipe = useRecipe();
  const [timer, setTimer] = useState(() => startingState(seconds, autoStart));
  const running = isRunning(timer);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setTimer((current) => tick(current, Date.now())), CLOCK_CHECK_MS);
    return () => clearInterval(interval);
  }, [running]);

  const startOrPause = () => {
    const now = Date.now();
    setTimer((current) => toggleRunning(current, now));
  };

  const finished = timer.remaining === 0;
  const startLabel = running ? "Pause" : finished ? "Start again" : "Start";
  const announcement = (
    <p aria-live="polite" className="sr-only">
      {finished ? "Rest over" : ""}
    </p>
  );

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 border-2 border-ink bg-surface p-3 shadow-[2px_2px_0_var(--swatch-ink)]">
        <p className="flex items-baseline gap-2">
          <span className={recipe.timer.label}>Rest</span>
          <span className="font-numbers text-4xl font-extrabold leading-none">{formatSeconds(timer.remaining)}</span>
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="px-3 py-1 text-base" onClick={startOrPause}>
            {startLabel}
          </Button>
          <Button variant="secondary" className="px-3 py-1 text-base" onClick={() => setTimer(resetTimer)}>
            Reset
          </Button>
        </div>
        {announcement}
      </div>
    );
  }

  return (
    <div className={recipe.timer.root}>
      <p className={recipe.timer.label}>Rest</p>
      <p className={recipe.timer.digits}>{formatSeconds(timer.remaining)}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={startOrPause}>
          {startLabel}
        </Button>
        <Button variant="secondary" onClick={() => setTimer(resetTimer)}>
          Reset
        </Button>
      </div>
      {announcement}
    </div>
  );
}
