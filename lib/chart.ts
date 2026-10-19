const STEP = 5;
const MAX_TICKS = 6;
const MAX_LABELS = 6;

// A y axis in multiples of 5 lb that leaves at least 5 lb above and below the data.
export function chartScale(values: number[]): { min: number; max: number; ticks: number[] } {
  const low = Math.max(0, Math.floor((Math.min(...values) - STEP) / STEP) * STEP);
  const high = Math.ceil((Math.max(...values) + STEP) / STEP) * STEP;
  // Widen the step (5, 10, 15, …) until the axis, rounded out to that step, fits in MAX_TICKS labels.
  let step = STEP;
  const rounded = (size: number) => ({ min: Math.floor(low / size) * size, max: Math.ceil(high / size) * size });
  while ((rounded(step).max - rounded(step).min) / step + 1 > MAX_TICKS) step += STEP;
  const { min, max } = rounded(step);
  const ticks: number[] = [];
  for (let tick = min; tick <= max; tick += step) ticks.push(tick);
  return { min, max, ticks };
}

// Which points get a date label: about six, evenly spread, always the first and last.
export function labelIndexes(count: number): number[] {
  if (count <= MAX_LABELS) return Array.from({ length: count }, (_, i) => i);
  const every = Math.ceil((count - 1) / (MAX_LABELS - 1));
  const indexes = [];
  for (let i = 0; i < count - 1; i += every) indexes.push(i);
  indexes.push(count - 1);
  return indexes;
}
