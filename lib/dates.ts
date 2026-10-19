// Date keys are the device's local calendar day as YYYY-MM-DD. They are built from the date's
// parts, never from toISOString(), which would use UTC and file late workouts under tomorrow.

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDateKey(key: string): Date | null {
  const match = KEY_PATTERN.exec(key);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  // new Date rolls 2026-02-30 over into March; a real date comes back unchanged.
  return toDateKey(date) === key ? date : null;
}

function mustParse(key: string): Date {
  const date = parseDateKey(key);
  if (!date) throw new Error(`Not a date key: ${key}`);
  return date;
}

export function addDays(key: string, days: number): string {
  const date = mustParse(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function weekStart(key: string): string {
  const daysSinceMonday = (mustParse(key).getDay() + 6) % 7;
  return addDays(key, -daysSinceMonday);
}

export function formatShort(key: string): string {
  const date = mustParse(key);
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

export function formatDayShort(key: string): string {
  return `${WEEKDAYS[mustParse(key).getDay()].slice(0, 3)}, ${formatShort(key)}`;
}

export function formatLong(key: string): string {
  const date = mustParse(key);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
