// While running, endsAt is the clock time (ms) the rest ends; remaining is derived from it.
export type TimerState = { total: number; remaining: number; endsAt: number | null };

export function newTimer(total: number): TimerState {
  return { total, remaining: total, endsAt: null };
}

export function isRunning(state: TimerState): boolean {
  return state.endsAt !== null;
}

// Reads the clock rather than counting calls, so a throttled or suspended tab catches up.
// A running timer stops itself when it reaches zero.
export function tick(state: TimerState, now: number): TimerState {
  if (state.endsAt === null) return state;
  const remaining = Math.max(0, Math.ceil((state.endsAt - now) / 1000));
  if (remaining === state.remaining && remaining > 0) return state;
  return { ...state, remaining, endsAt: remaining > 0 ? state.endsAt : null };
}

// Start or pause at `now`. Starting a finished timer runs it again from the top.
export function toggleRunning(state: TimerState, now: number): TimerState {
  if (state.endsAt !== null) return { ...tick(state, now), endsAt: null };
  const remaining = state.remaining === 0 ? state.total : state.remaining;
  return { ...state, remaining, endsAt: now + remaining * 1000 };
}

export function resetTimer(state: TimerState): TimerState {
  return newTimer(state.total);
}

export function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
