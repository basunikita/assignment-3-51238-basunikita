# Plate Log: design spec

**Date:** 2026-10-18

**Status:** Approved by Nikita on 2026-10-18, after a builder check. It comes from the plan she
approved in plan mode the same day.

Calls Claude made on details Nikita didn't discuss are marked **(Claude's call)**. Everything else
was decided by Nikita or accepted by her in review.

## 1. Goal

Build a small everyday tool for MPCS 51238 Assignment 3, "Patterns & Flows", due Tuesday
2026-10-20 at 5:30 PM. It's **a daily exercise log for Nikita's own gym routine**, built around
three flows: first visit, logging, and coming back.

**Who it's for:** Nikita, on her phone, at the machine, between sets. She's a beginner and follows
the routine she wrote in Assignment 2. Each visit answers two things: "what did I lift last
time?" and "what should I try today?"

**What it must do:**
1. Log sets, reps and weight for each exercise.
2. Keep each exercise's history of previous weights.
3. Graph the max weight each time an exercise is done.
4. Keep the history of workouts on past days.
5. Add new exercises.

**Brief requirements this spec has to meet:**
- **Flows:** the first visit, the core task and coming back all work end to end.
- **First visit:** useful right away, with no empty screen that leads nowhere.
- **Forms:**
  - one column, with a real label on every field;
  - errors next to the field that say what to do;
  - what the person typed is kept.
- **Coming back:** it remembers what's saved locally, and the return visit is designed for.
- **Components:** shared components, used the same way everywhere.
- **Navigation:** clear where you are and how to get back.
- **Accessibility:** works with a keyboard, real labels, contrast checked.
- **Simplicity:** no unneeded steps, fields or packages.

**Tech:** Next.js 16.3.8, React 19.2.8, Tailwind 4 and TypeScript. Data is saved in
`localStorage`, with no database, accounts or external APIs. It deploys on Vercel's Hobby plan.

## 2. Look: Plate Room (reused from Assignment 2)

The look is gym signage and bumper plates on a painted concrete wall: heavy outlines, condensed
type and huge numbers.

**Colors:**

| Token | Hex | Use |
|---|---|---|
| concrete | `#E9E8E4` | page background |
| panel | `#FFFFFF` | surfaces |
| ink | `#121212` | text, focus and controls |
| muted | `#55534E` | secondary text |
| steel | `#BDBBB4` | light dividers |
| safety yellow | `#FFD400` | fill only, never text |
| blue | `#1F5FBF` | upper-body days |
| red | `#D7262D` | legs |
| green | `#187A43` | cardio |

**Type and shapes:**
- Fonts: Big Shoulders for headings, Archivo for body text and labels, and Big Shoulders Stencil
  for numbers (weights, reps, the streak).
- 2px ink borders, a 2px offset ink shadow on buttons and cards, and square corners.
- Labels are uppercase, small and bold with wide letter-spacing.

**Yellow** is used for each page's one primary action, a ticked set, and progress fill. Per
Nikita's 2026-10-12 decision, it may also decorate (section numbers, small labels, spacing bars).

**Body-part badges** name the body part: "Upper body" in blue, "Legs" in red, "Cardio" in green.

**Layout (Claude's call):** one centered column about 560px wide, because this is a phone tool. At
390px wide there's no sideways scrolling. Tap targets are at least 44px.

## 3. The routine (seed data)

The seed is copied from `assignment-2-51238-basunikita/app/design-system/content.ts`. Every
strength exercise is 3 sets × 10 reps.

| Day id | Name | Tone | Exercises |
|---|---|---|---|
| `back-biceps` | Back and biceps | upper (blue) | Lat pulldowns · Face pulls · Single-arm dumbbell rows · Lower back hyperextensions · African bicep curls · Cable bicep curls · Barbell curls |
| `shoulders-triceps` | Shoulders and triceps | upper (blue) | Cable lateral raise · Shoulder superset: O movements and serving platters · Archer pull · Front raise cable · Overhead tricep extension cable · Tricep cross extension · Tricep press |
| `legs` | Legs | legs (red) | Hip thrusts · RDLs · Bulgarian split squats · Hip abduction / adduction · Glute hyperextensions |
| `cardio` | Cardio | cardio (green) | Run 30 min (40 min total: walk 5, run 30, walk 5) · Run–walk intervals (58 min: walk 5, (run 15, walk 1) × 3, walk 5) · Incline walk (30 min) · Stairs (25 min) |
| `rest` | Rest | rest (ink) | none |

**Days (Claude's call):** the routine's three cardio days are the same workout, so the day picker
shows **one Cardio choice**. The day picker has five choices in routine order: Back and biceps,
Shoulders and triceps, Legs, Cardio, Rest.

**Exercise IDs (Claude's call):** a slug of the name (e.g. `lat-pulldowns`). Seeded IDs never
change. A custom exercise whose slug is already taken gets `-2`, `-3`, and so on.

## 4. Pages

Each step of a flow is its own route. Every page shares:
- **The app shell:**
  - a bottom tab bar, `<nav aria-label="Main">`, with **Today · History · Exercises**;
  - the current tab is filled ink and carries `aria-current="page"`;
  - the bar is fixed to the bottom of the screen on phones.
- **Inner pages:** a back link at the top ("← Back and biceps") and an `h1`.
- **A footer line:** "Saved on this device".

Pages are client components that read `localStorage` after they mount. Until the data is loaded,
they show the shared loading state ("Loading your log…"), so the server-rendered page never
disagrees with the browser's data. No static export is used, because custom exercise IDs only
exist in the browser.

### 4.1 `/`: Today

**First visit** (nothing logged yet):
- Eyebrow "PLATE LOG", then the heading "WHICH DAY ARE YOU DOING?"
- One line: "Your routine is loaded. Pick today's day and log each set as you go."
- **The day picker:** five cards, one per day.
  - Each card has the day name, its body-part badge and a count ("7 exercises · 3 × 10";
    Cardio: "4 options"; Rest: "Nothing to log").
  - Each card is a link to `/workout/[day]`.
- No tour, no setup and no empty list.

**Coming back** (at least one workout logged):
- Eyebrow "WELCOME BACK".
- **If today already has an unfinished workout:** a "Continue" card at the top, e.g. "Continue Back
  and biceps · 2 of 7 exercises done". It links to that workout.
- **The week strip** (§6.3) and **the streak** (§6.4).
- The last workout: "Last workout: Legs · Thu, Oct 16". It links to `/history/[date]`.
- Then the same heading and day picker as the first visit. Each card adds "Last done Oct 14".

### 4.2 `/workout/[day]`: the picked day

**Header:**
- Back link "← Today", the `h1` with the day name, and the badge.
- Strength days add "7 exercises · 3 × 10".
- **Continue it:** if a workout for this day already exists today, it's reopened. A line says
  "Continuing today's workout · 2 of 7 done".

**Strength days:**
- **The exercise list:** one row per exercise, in routine order.
  - Each row has the exercise name and a line about last time:
    - "Last 3 × 10 @ 50 lb · try 55" (the suggestion follows §6.1);
    - or "Not logged yet";
    - or "Last 3 × 10 · bodyweight".
  - Each row shows today's progress: "1/3 sets", or a black DONE badge when all of today's sets
    are ticked.
  - Each row is a link to `/workout/[day]/[exercise]`.
- **"Extras" section:** every exercise whose day is "Any day (extra)", in the order they were
  added, as the same kind of row. If there are none, it says "No extras yet" with the link below.
- **"Add an exercise":** a secondary link to `/exercises/new?day=<day>&returnTo=/workout/<day>`.
- **Finish workout:** the page's one primary button.
  - If nothing is ticked, an error sits under the button: "Tick at least one set before finishing."
  - Otherwise it records `finishedAt`, goes to `/`, and shows a toast: "Workout saved · 5
    exercises, 15 sets".

**Cardio:**
- **A radio group** ("Which cardio did you do?") of four cards, each with the option name and its
  steps.
- **Minutes**, a number field with the label "Minutes". It fills in with the chosen option's total
  (40 / 58 / 30 / 25) and changes when the choice changes, unless she has typed in it.
- **Save cardio** (primary) saves the workout and finishes it, goes to `/`, and shows the toast
  "Cardio saved · Incline walk, 30 min".
- **Errors:**
  - No option chosen: "Choose which cardio you did."
  - Minutes empty, not a whole number, or outside 1–300: "Enter how many minutes you did, from
    1 to 300."
- **Reopening** the same date shows the saved choice and minutes, and **Save cardio** updates them.

**Rest:** the shared empty state: "Rest day: nothing to log. Enjoy it." It shows the week strip, a
link "See your history", and no primary button.

**Unknown day in the URL:** the shared error state: "That day isn't in your routine." It links
back to Today.

### 4.3 `/workout/[day]/[exercise]`: log an exercise

**Header:** back link "← Back and biceps" (the day), the `h1` with the exercise name, and its badge.

**Last time and the suggestion:**
- With history: "Last time · Oct 14: 3 × 10 @ 50 lb".
- If §6.1 gives a suggestion, a secondary button **"Use 55 lb"** fills 55 into the weight of every
  set not yet ticked.
- With no history: "First time. Pick a weight you can lift 10 times."

**Set rows** (start with 3):
- Each row has "SET 1", then **Reps** (`inputmode="numeric"`) and **Weight (lb)**
  (`inputmode="decimal"`). Both have visible labels; on phones they're the row's column headers,
  tied to each input with `aria-labelledby`. Then a **✓ button** whose accessible name is "Save
  set 1".
- **Filled in from last time:** reps and weight come from the same set number last session. If last
  time had fewer sets, the last set is repeated. With no history, reps are 10 and weight is empty.
- **Tapping ✓:**
  - checks the row (§7);
  - when the row is valid, marks it done and saves straight away;
  - a done row is filled yellow, keeps its numbers and stays editable;
  - tapping ✓ on a done row un-ticks it;
  - editing a done row saves when the field loses focus, if it's still valid.
- **Typing reps in set 1 fills every untouched set below it with the same value** (borrowed from
  TrackMySet).
- **Add set** adds a row filled in from the row above it.
- **Remove set:** each row past the first has a "Remove set 2" button. It removes the row, and a
  toast offers **Undo**.

**Rest timer:**
- The reused `RestTimer` starts counting down after each ✓.
- It has 60 s / 90 s / 2 min choices, defaulting to 90 s.
- The choice is remembered in settings.
- While it runs, it sticks to the bottom of the exercise page, above the tab bar.
- **It belongs to the exercise page only (Claude's call):** leaving the page or reloading stops it.
  A rest only matters between sets of the same exercise.

**New best:**
- When a ticked set's weight is greater than this exercise's best from *previous* dates, a status
  banner says "New best: 55 lb (was 50 lb)".
- There's no banner on the very first log.

**Chart:**
- A small max-weight chart (§6.2) for this exercise, with today's ticked sets included.
- With one point, the dot shows plus "Log it again to see your line."

**Done:** "Done with this exercise" (secondary) goes back to the day page.

**Unknown exercise:** the shared error state: "We couldn't find that exercise." It links to the day.

### 4.4 `/history`: past workouts

**Month calendar** (Claude's call):
- A Monday-first grid for the current month, with "Previous month" / "Next month" buttons.
- Days with a workout are filled with that day's tone color; if two workouts share a date, the cell
  is split.
- Those days are links to `/history/[date]`, with names like "Thursday, October 16: Legs".
- Days without workouts aren't focusable.
- Today has an ink outline.

**List under the calendar:**
- Every date with a workout, newest first: "Thu, Oct 16 · Legs · 5 exercises, 15 sets", or "Sat,
  Oct 18 · Cardio · Incline walk, 30 min".
- Each row is a link to `/history/[date]`.

**Empty:** the shared empty state: "No workouts yet. Log your first one from Today." It links to `/`.

### 4.5 `/history/[date]`: one day

**Header:** back link "← History" and the `h1` with the date ("THURSDAY, OCTOBER 16").

**Each workout that day is a card:**
- **Strength:**
  - The card has the day name, its badge, and a table per exercise with Set, Reps and Weight.
    Reps and Weight are editable with the same fields and rules as §4.3, and save when a field
    loses focus.
  - Only ticked sets are shown, and each has "Remove set". Sets that were typed but never ticked
    aren't history, so they don't appear (§5).
- **Cardio:** the same radio group and Minutes field, plus "Save changes".
- **"Delete workout"** (secondary) on every card removes it right away. A toast says "Deleted Legs
  workout" with an **Undo** button.

**No workouts on that date** (e.g. after deleting the last one): the shared empty state "Nothing
logged on this day." It links to History.

**Invalid date in the URL:** the shared error state.

### 4.6 `/exercises`: all exercises and bests

- The `h1` "EXERCISES", then the primary button **Add exercise** (`/exercises/new`).
- Exercises are grouped under Back and biceps, Shoulders and triceps, Legs, and Extras.
- **Each row:**
  - the name;
  - "Best 55 lb" (or "Best: bodyweight", or "Not logged yet");
  - "Last Oct 14";
  - a link to `/exercises/[id]`.

**The list of bests:** this page is the list, with each exercise's best on its row. There's no
separate "Recent bests" section (Claude's call after the builder check, to keep it simple).

### 4.7 `/exercises/new`: add an exercise (the form)

The form is one column, with two fields and one button:
1. **Exercise name:** a text input with the label "Exercise name".
   - Required. Spaces at either end are trimmed. At most 60 characters.
   - Must be unique, ignoring capital letters.
2. **Which day?** A radio group, legend "Which day?".
   - Options: Back and biceps / Shoulders and triceps / Legs / Any day (extra).
   - Required. It's pre-selected only when the page was opened with `?day=` for a strength day.
     From the cardio or rest page, `?day=` is ignored.
3. **Add exercise** (primary).

**Errors:**
- They're checked when she presses Add exercise. After the first failed attempt, they're checked
  again as she types.
- Each error sits under its field, with `aria-invalid` and `aria-describedby`.
- Focus moves to the first field with an error.
- What she typed is always kept.
- The messages:
  - "Enter a name for the exercise."
  - "Keep the name under 60 characters."
  - "You already have an exercise called Face pulls." (using the stored name)
  - "Choose which day it belongs to."

**On success:** it saves the exercise (`custom: true`), goes to `returnTo` if it's an in-app path
or to `/exercises/[id]` otherwise, and shows the toast "Added Leg press".

### 4.8 `/exercises/[id]`: one exercise

- **Header:** back link "← Exercises", the `h1` with the name, its badge (or "Any day"), and "Best
  55 lb".
- **The max-weight chart** (§6.2) across every date.
- **Session history, newest first:** date · sets ("3 × 10 @ 50 lb", or "10, 10, 8 @ 50 lb" when
  the reps differ) · that day's max. Each date links to `/history/[date]`.
- **Never logged:** the shared empty state: "No sets logged yet. Find it in a workout to log your
  first set."

## 5. Data

**One key:** `localStorage["plate-log:v1"]`, holding

```ts
type Store = {
  version: 1;
  exercises: { id: string; name: string; dayId: StrengthDayId | "extra"; custom: boolean }[];
  workouts: Workout[];
  settings: { restSeconds: 60 | 90 | 120 };
};
type Workout = {
  id: string;            // crypto.randomUUID()
  date: string;          // local YYYY-MM-DD, from the device's date (never toISOString)
  dayId: DayId;          // "back-biceps" | "shoulders-triceps" | "legs" | "cardio"
  entries: { exerciseId: string; sets: { reps: number | null; weight: number | null; done: boolean }[] }[];
  cardio?: { optionId: "run" | "intervals" | "incline" | "stairs"; minutes: number };
  finishedAt?: string;   // ISO timestamp
};
```

**Creating workouts:**
- **A workout is created the first time something is saved** (a set ticked, or cardio saved), not
  when a day is opened. That way, opening a day by mistake leaves no empty workout in history.
- **Unticked rows (Claude's call after the builder check):**
  - Before the workout exists, the rows live only in the page.
  - Once it exists, every row of an exercise is saved whenever it changes: typed numbers, added
    rows and removed rows. That way, what she typed survives if the phone closes the tab between
    sets.
  - Only ticked sets count anywhere else. History, last time, bests, the chart, the streak and the
    "1/3 sets" progress (ticked rows out of all rows) use ticked sets only.
- **Continue it:** opening `/workout/[day]` finds the workout with today's `date` and that `dayId`.
  There is at most one per date and day.
- **Finished workouts can still be edited.** Ticking a set on a finished workout keeps
  `finishedAt`.
- A workout whose last ticked set is removed stays until it's deleted. **(Claude's call)**

**What counts:**
- A **logged set** is `done: true` with valid reps and weight.
- A **workout counts for history, the week strip and the streak** when it has at least one logged
  set, or a cardio entry.

**Seeding:** on first load, if the key is missing, write the seed: routine exercises, no workouts,
`restSeconds: 90`.

**Errors (Claude's call):**
- **Data that can't be read** (bad JSON or the wrong shape): keep the raw text under
  `plate-log:unreadable-<timestamp>`, write a fresh seed, and show a one-time banner: "We couldn't
  read your saved log, so we started a fresh one. Your old data is kept in this browser."
- **No storage** (private mode, or an exception on access): run in memory and show a banner on every
  page: "This browser isn't saving your log. It will be lost when you close the tab."
- **Other tabs:** listen for the `storage` event so two tabs stay in sync.

**Structure:**
- Calculations are pure functions in `lib/`, tested with node:test.
- `localStorage` is reached only through `lib/storage.ts`.
- Components read through one small store hook.

## 6. Coming back

### 6.1 Last time and the suggested weight
- **Last session** for an exercise is the most recent date *before today* with a logged set.
- **The suggestion (Claude's call):**
  - If every logged set that day reached 10 reps, suggest that day's max weight + 5 lb.
  - Otherwise suggest the same max weight.
  - There's no suggestion when there's no history, or when the max weight was 0 (bodyweight).

### 6.2 The max-weight chart
- One point per date: the heaviest logged set on that date (all of that day's workouts together).
- Hand-written SVG, with no chart package.
- Points are evenly spaced along the x axis, with short date labels ("Oct 14"). Thin it to about
  6 labels when there are many.
- The y axis labels "lb" at 5 lb steps that cover the data, with some room above and below.
- An ink line with square markers. The latest point has a yellow fill with an ink border.
- `role="img"` with a text summary, e.g. "Max weight for Lat pulldowns went from 50 lb on Oct 14
  to 55 lb on Oct 18, over 2 sessions." The same summary shows as a caption.

### 6.3 Week strip (Claude's call)
- Monday to Sunday of the current week. Each cell shows the weekday letter and the date number.
- A cell is filled with the tone of that date's workout. If a date has two workouts, the cell is
  split in two.
- Today has a thick ink outline. Future days are steel-outlined and empty.
- Every cell has an accessible name, e.g. "Thursday, October 16: Legs" or "Friday, October 17:
  nothing logged".

### 6.4 Streak (Claude's call)
- The number of Monday-starting weeks in a row with at least one workout that counts.
- It counts back from the current week. If the current week has nothing yet, it counts from last
  week, so the streak doesn't break midweek.
- Display: a big stencil number and "WEEKS IN A ROW" (1 shows "WEEK IN A ROW").
- With a streak of 0, it shows "Log a workout this week to start a streak."

### 6.5 New best
- §4.3 shows the banner when you log.
- The workout's finish toast adds "· 2 new bests" when there were any.

## 7. Checking set input

Both fields are checked when ✓ is tapped and when a done row's field loses focus. Errors sit under
the field and are announced with `role="alert"` on the first failure. What was typed is kept.

**Reps:**
- Empty → "Enter how many reps you did."
- Not a whole number from 1 to 100 → "Enter reps as a whole number from 1 to 100."

**Weight:**
- Empty → "Enter the weight you lifted, in lb."
- Not a number, or below 0 → "Enter a weight of 0 or more (0 for bodyweight)."
- Above 1000 → "Enter a weight under 1,000 lb."
- Steps of 0.5 are allowed.

**Bodyweight:** a weight of 0 means bodyweight. Nikita chose this after the builder check.
- It replaces the plan's "Enter a weight above 0", because some routine exercises use no weight:
  hyperextensions, and O movements / serving platters.
- 0 lb shows as "bodyweight" in last time, bests and history.
- A bodyweight-only exercise gets no suggestion and no chart line. Its chart area says "Bodyweight
  exercise: no weight to chart."

## 8. Shared components

**Copied from Assignment 2** (`assignment-2-51238-basunikita/app/design-system/`) with the
Plate Room recipe:
- Button, TextInput, RadioGroup, Badge, StatePanel, RestTimer;
- `timer.ts`, `contrast.ts`, the `RecipeProvider` and `PLATE_ROOM_RECIPE`;
- `moods.ts` (the plate-room entry only), `fonts/plate-room.ts`, and the `globals.css` theme
  wiring.

**Fixes to make while copying:**
- Disabled controls must not show hover styles.
- `RestTimer` restarts when `seconds` changes.

**New, all built from the recipe's styles:**
- AppShell and TabBar
- PageHeader (back link, eyebrow, `h1`, badge)
- DayCard
- ExerciseRow
- SetRow
- NumberField (TextInput plus the error wiring)
- WeekStrip
- StreakBadge
- MaxWeightChart
- MonthCalendar
- Toast (`role="status"`, with an optional Undo button, 8 seconds, reachable by keyboard)
- Banner (warnings and new bests)

**Shared states:** loading, empty and error all use the one `StatePanel`, each with a link back.

**Gotcha:** Tailwind's `@theme inline` emits no `--color-*` variables. Arbitrary values must read
`--swatch-*` or `--mood-*`. A test checks this.

## 9. Accessibility

- Every control is a native button, link or input. There are no clickable divs.
- Every input has a real label. Errors are tied to their input with `aria-describedby` and
  `aria-invalid`.
- There's a visible focus ring on everything (from the recipe's `focus-state`).
- A logical heading order, plus a skip link to the main content.
- The calendar and week strip have accessible names. The chart has a text summary.
- Contrast: reuse `contrast.ts` and its test across the Plate Room roles, plus the plate colors as
  fills behind white text.
- Every page gets a keyboard-only pass, and every flow is checked at 390px.

## 10. Testing

`npm test` runs `node --test` on `tests/*.test.mjs`, which import the `lib/*.ts` files directly
(Node 24 strips the types). The tests cover:
- seed;
- storage: unreadable data and no-storage fallback;
- local date formatting;
- continue-it lookup;
- last session, best and suggestion, including bodyweight;
- chart series;
- week strip and streak, including midweek and gap weeks;
- set and form checks with their exact messages;
- slug uniqueness;
- delete and restore;
- the contrast and design-system checks from Assignment 2.

**Pages are checked by hand in Chrome at phone width**, against §11's walkthrough.

**Sample history for reviews (Claude's call after the builder check):** the coming-back screens
need workouts dated before today. A **development-only** page at `/dev/sample` fills them in.
- It returns "not found" outside `next dev`, so the live site's first visit stays clean.
- **What it loads:** three weeks of past workouts for Nikita's routine, with weights climbing 5 lb
  at a time, a missed week, and one bodyweight exercise. That makes "last time", the suggestion,
  the new-best banner, the chart, the week strip and the streak all visible in review rounds.
- **"Load sample history":** keeps the current data under `plate-log:backup-<timestamp>`, then
  replaces it.
- **"Clear everything":** goes back to a first visit.

**Nikita reviews each page in the browser, one round at a time.** Each round is its own commit.

## 11. Walkthrough (acceptance)

1. **Empty storage.** `/` shows "WHICH DAY ARE YOU DOING?" and five day cards.
2. **First log:**
   - Back and biceps → Lat pulldowns.
   - The set rows show 10 reps and an empty weight. Tapping ✓ shows "Enter the weight you lifted,
     in lb."
   - Type 50 and ✓ all three sets. The rest timer starts.
3. **Reload** and open Back and biceps. It says "Continuing today's workout · 1 of 7 done".
4. **Finish workout.** The toast appears, and `/` shows the welcome back, week strip and streak of 1.
5. **Second session.** In dev, open `/dev/sample` and load sample history (or put a past-dated
   workout in test data).
   - Lat pulldowns shows "Last time · …: 3 × 10 @ 50 lb" and **Use 55 lb**.
   - Ticking 55 shows "New best: 55 lb (was 50 lb)".
   - The chart has 2 points and a caption.
6. **History:**
   - It shows both dates.
   - On a date, change a weight, remove a set and Undo it, then delete the workout and Undo that.
7. **Exercises → Add exercise:**
   - An empty name gives its error. "Face pulls" gives the duplicate error.
   - "Leg press" + Any day (extra) saves.
   - It appears under Extras on every strength day.
8. **Cardio:** pick Incline walk. Minutes fill in as 30; change it to 35 and save.
9. **The whole flow with only the keyboard**, with no horizontal scroll at 390px.

## 12. Shipping

This is in scope (plan step 8).

**GitHub and Vercel:**
- Nikita creates the public GitHub repo `basunikita/assignment-3-51238-basunikita`, as she did for
  Assignment 2. Claude adds it as `origin` and pushes over SSH.
- Nikita imports the repo into Vercel's dashboard (Hobby plan), so each push to `main` redeploys.

**The first-run check:**
- After deploying, an agent opens the live URL as a brand-new user with the goal "Log today's
  workout". It goes through the first visit and logging, then pretends to come back later by
  reloading and revisiting.
- Its usability feedback goes in the README under "First-run check", along with what was changed
  because of it.

## 13. Out of scope

- Accounts, sync, export and import.
- Renaming, reordering or deleting exercises.
- Editing the routine's order.
- kg.
- Tracking body weight.
- Form cues.
- Notifications.
- Days pinned to weekdays.
- A "next day in order" suggestion. (Nikita chose to pick the day each time.)
