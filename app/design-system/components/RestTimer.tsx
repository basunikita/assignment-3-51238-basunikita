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
};

function startingState(seconds: number, autoStart: boolean): TimerState {
  const timer = newTimer(seconds);
  return autoStart ? toggleRunning(timer, Date.now()) : timer;
}

// To restart it (a new set ticked, or a new length), the parent changes its key.
export default function RestTimer({ seconds, autoStart = false }: RestTimerProps) {
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
  return (
    <div className={recipe.timer.root}>
      <p className={recipe.timer.label}>Rest</p>
      <p className={recipe.timer.digits}>{formatSeconds(timer.remaining)}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={startOrPause}>
          {running ? "Pause" : finished ? "Start again" : "Start"}
        </Button>
        <Button variant="secondary" onClick={() => setTimer(resetTimer)}>
          Reset
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {finished ? "Rest over" : ""}
      </p>
    </div>
  );
}
