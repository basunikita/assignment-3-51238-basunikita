# Plate Log

A daily exercise log for my gym routine, built for Design, Build, Ship (MPCS 51238),
Assignment 3: Patterns & Flows. I log sets, reps and weight on my phone between sets; it shows
what I lifted last time, graphs my max weight for each exercise, keeps a history of past
workouts, and lets me add new exercises. It saves to the browser, so there's no account.

It reuses the **Plate Room** style and my workout routine from Assignment 2.

- Live site: https://assignment-3-51238-basunikita.vercel.app
- Flows: [`flows.md`](flows.md)
- Onboarding research: [`docs/research/onboarding.md`](docs/research/onboarding.md)

## Flows

**Main task:** I pick today's day → I log each set as I finish it → I come back next week and it
shows what I lifted last time, set by set, and my chart is going up.

```mermaid
flowchart TD
  A[Open app] --> B{Anything saved?}
  B -- No --> C["First visit: 'Your routine is loaded. Which day are you doing?'"]
  B -- Yes --> D["Welcome back: week strip, streak, last workout"]
  C --> E[Pick day]
  D --> E
  E -- Strength --> F["Workout: exercises in order, each with 'Last 3×10 @ 50 lb'"]
  E -- Cardio --> G["Pick which of my four cardio options I did"] --> S
  E -- Rest --> R["Rest day: week strip and link to history"]
  F --> H["Log exercise: 3 set rows filled in, chart of past max weights"]
  H --> I{Valid?}
  I -- No --> J["Message under the field; typed value kept"] --> H
  I -- Yes --> K["Set ✓ → rest timer · 'New best: 55 lb (was 50)'"]
  K --> H
  H --> F
  F --> S["Finish workout → saved to history"]
  S --> D
  D --> T["History by day → edit or delete, with Undo"]
  D --> U["Exercises → history, chart, bests · Add exercise form"]
```

See [`flows.md`](flows.md) for what happens on each step and the list of pages.

## Onboarding research

Before designing the first visit, agents studied three browser-based trackers that need no
account — Liftosaur, Setly and TrackMySet — by using each one as a brand-new user. All three
drop you on an empty screen, and none of them shows a single form error. So Plate Log opens with
my routine already loaded and explains every error next to the field. Details and screenshots:
[`docs/research/onboarding.md`](docs/research/onboarding.md).

## Pages

Every step of the flows is its own page, and every page shares the bottom tab bar
(Today · History · Exercises). Inner pages add a back link and a title.

| Route | What it's for |
|---|---|
| `/` | Today: first visit or welcome back, week strip, streak, pick the day |
| `/workout/[day]` | The day's exercises with last time, cardio choice, or rest day |
| `/workout/[day]/[exercise]` | Log each set (prefilled from last time), rest timer, max-weight chart |
| `/history` | Month calendar and every past workout |
| `/history/[date]` | One day: fix a set, change cardio, delete a workout (with Undo) |
| `/exercises` | Every exercise and its best |
| `/exercises/new` | The add-exercise form |
| `/exercises/[id]` | One exercise's chart and sessions |

## Accessibility

- **Keyboard:** everything is a real button, link or input, and works with the keyboard.
  - A skip link comes first.
  - Every control shows a 3px focus ring.
  - Inside the set rows, Tab goes reps → weight → ✓.
- **Labels:** every field has a real label. The set table ties each input to its column header
  and set number ("Reps, Set 1").
- **Errors:** each error is tied to its field and announced, and it says what to do next.
- **Screen readers:** the week strip and calendar name every day. The chart has a text summary.
- **Tap targets:** every control is at least 44px, with no sideways scrolling at 390px wide.
  Checked page by page in Chrome.
- **Contrast** (WCAG, checked by `npm test` in `tests/theme.test.mjs`):

| Text on background | Ratio |
|---|---|
| Ink on concrete (page) | 15.3:1 |
| Muted on concrete | 6.3:1 |
| Ink on white panel | 18.7:1 |
| Muted on white panel | 7.7:1 |
| Ink on safety yellow (buttons, ticked sets) | 13.1:1 |
| White on blue (upper body) | 6.1:1 |
| White on red (legs) | 5.0:1 |
| White on green (cardio) | 5.4:1 |

Yellow is only ever a fill behind ink text, never text itself (1.4:1 on white).

## First-run check

After deploying, I gave a fresh agent the live URL. It had never seen the app or its design, and
its goal was **"Log today's workout."**
- It went through the first visit and logged two exercises set by set, making mistakes on purpose.
- It finished the workout.
- Then it "came back next week": it moved its first workout's date back a week and reloaded.
- It used a 390px phone frame.

**What it found:**

- **First visit:** "the purpose is obvious." It was **4 taps to the first logged set**: pick the day,
  pick the exercise, type the weight, ✓. The only confusion was that "your routine" wasn't *its*
  routine, and it couldn't change it.
- **Main task:** logging is fast. Every error it triggered was specific and sat under the right row:
  - "Enter the weight you lifted, in lb."
  - "Enter reps as a whole number from 1 to 100."
  - "Choose which day it belongs to."

  Focus moved to the field with the problem. Friction: on a first session, sets 2 and 3 started
  with a blank weight.
- **Coming back:** "the best part." It got:
  - Welcome back, the week strip and "2 weeks in a row";
  - "Last time · Oct 11: …" with every set prefilled, so logging became one tap per set;
  - a max-weight chart with a plain-language summary;
  - "Workout saved · 1 exercise, 3 sets · 1 new best".

**Its ranked issues, and what I did about them:**

| # | Issue it found | What changed |
|---|---|---|
| 1 | The preloaded routine can't be edited, renamed or removed | **Not changed.** Plate Log is built around my own routine. Editing it was out of scope in the spec. |
| 2 | An exercise done today showed "DONE" next to "Not logged yet" | **Fixed:** the row now shows today's sets, e.g. "Today 3 × 10 @ 40 lb". |
| 3 | After Finish, reopening the day still said "Continuing today's workout", and History didn't mark unfinished workouts | **Fixed:** it now says "Finished today · you can still edit", and History marks unfinished workouts "in progress". |
| 4 | On a first session, the weight wasn't carried to the next set | **Fixed:** ticking a set fills the blank weights of the untouched sets below it. |
| 5 | The Undo bar covered the docked rest timer | **Fixed:** the Undo bar now sits above the timer. |
| 6 | A newly added exercise's page is a dead end ("Find it in a workout"), and extras count toward "1 of 8 done" | **Not changed:** extras appear on every strength day, so they're one tap away in any workout. |
| 7 | Small things: "Welcome back" right after the first workout, "Start" instead of "Resume" on a paused timer, the Exercises tab highlighted while adding from a workout | Noted for later. |

What it said worked well:
- no setup;
- the error handling;
- the return value from "Last time" and the prefilled sets;
- Undo instead of confirm dialogs;
- a back link and a marked tab on every page;
- a logical tab order with a visible focus ring.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests for the data, stats, validation and theme
npm run build
npm run lint
```

To review the coming-back screens without waiting a week, open `/dev/sample` (only available
in `next dev`, or when the server runs with `PLATE_LOG_SAMPLE=1`). It backs up your log, then
loads three weeks of sample workouts.

Built with Next.js 16 and Tailwind CSS 4. Data lives in `localStorage` only — no database,
accounts or external APIs.
