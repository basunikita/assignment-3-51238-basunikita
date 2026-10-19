import type { Tone } from "@/lib/types";

// Plate colors as fills (white text reaches 4.5:1 on each; see tests/theme.test.mjs).
export const TONE_FILL: Record<Tone, string> = {
  upper: "bg-(--swatch-blue) text-(--swatch-panel)",
  legs: "bg-(--swatch-red) text-(--swatch-panel)",
  cardio: "bg-(--swatch-green) text-(--swatch-panel)",
  rest: "bg-surface text-ink",
};

// A thick bar down the side of a card in the day's color.
export const TONE_BAR: Record<Tone, string> = {
  upper: "bg-(--swatch-blue)",
  legs: "bg-(--swatch-red)",
  cardio: "bg-(--swatch-green)",
  rest: "bg-line",
};
