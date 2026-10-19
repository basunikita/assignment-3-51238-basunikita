import { findByName } from "./exercises.ts";
import type { Store } from "./types.ts";

// Every error says what to do next (spec §4 and §7).
export const MESSAGES = {
  repsEmpty: "Enter how many reps you did.",
  repsRange: "Enter reps as a whole number from 1 to 100.",
  weightEmpty: "Enter the weight you lifted, in lb.",
  weightRange: "Enter a weight of 0 or more (0 for bodyweight).",
  weightMax: "Enter a weight under 1,000 lb.",
  cardioOption: "Choose which cardio you did.",
  finishEmpty: "Tick at least one set before finishing.",
  nameEmpty: "Enter a name for the exercise.",
  nameLong: "Keep the name under 60 characters.",
  nameTaken: (name: string) => `You already have an exercise called ${name}.`,
  dayMissing: "Choose which day it belongs to.",
};

export type Checked = { value: number | null; error: string | null };

const NAME_LIMIT = 60;
const MAX_REPS = 100;
const MAX_WEIGHT = 1000;
const FORM_DAYS = new Set(["back-biceps", "shoulders-triceps", "legs", "extra"]);

// Plain decimal numbers only; a comma works as the decimal point.
export function parseNumber(raw: string): number | null {
  const text = raw.trim().replace(",", ".");
  return /^\d+(\.\d+)?$/.test(text) ? Number(text) : null;
}

function checkWholeNumber(raw: string, max: number, emptyError: string, rangeError: string): Checked {
  if (!raw.trim()) return { value: null, error: emptyError };
  const value = parseNumber(raw);
  if (value === null || !Number.isInteger(value) || value < 1 || value > max) return { value: null, error: rangeError };
  return { value, error: null };
}

export function checkReps(raw: string): Checked {
  return checkWholeNumber(raw, MAX_REPS, MESSAGES.repsEmpty, MESSAGES.repsRange);
}

// 0 is bodyweight; half-pound steps are allowed.
export function checkWeight(raw: string): Checked {
  if (!raw.trim()) return { value: null, error: MESSAGES.weightEmpty };
  const value = parseNumber(raw);
  if (value === null || !Number.isInteger(value * 2)) return { value: null, error: MESSAGES.weightRange };
  if (value >= MAX_WEIGHT) return { value: null, error: MESSAGES.weightMax };
  return { value, error: null };
}

export function checkExerciseForm(store: Store, input: { name: string; dayId: string | null }): { name?: string; day?: string } {
  const errors: { name?: string; day?: string } = {};
  const name = input.name.trim();
  const existing = findByName(store, name);
  if (!name) errors.name = MESSAGES.nameEmpty;
  else if (name.length > NAME_LIMIT) errors.name = MESSAGES.nameLong;
  else if (existing) errors.name = MESSAGES.nameTaken(existing.name);
  if (!input.dayId || !FORM_DAYS.has(input.dayId)) errors.day = MESSAGES.dayMissing;
  return errors;
}

// Where the add-exercise form may send you back to: a path inside this app, nothing else.
// Parsing it as a URL catches tricks like "/\t/evil.example", which browsers read as //evil.example.
export function safeReturnTo(raw: string | undefined): string | null {
  if (!raw || !raw.startsWith("/")) return null;
  const base = "http://plate-log.invalid";
  const url = new URL(raw, base);
  if (url.origin !== base) return null;
  const path = url.pathname + url.search + url.hash;
  return path === raw ? raw : null;
}
