# How similar tools welcome someone new

**Date:** 2026-10-18

**Method:** I picked three browser-based workout trackers that don't need an account. Agents then
used each one in Chrome as a brand-new user:
1. go through the first visit;
2. log "Lat pulldown, 3 × 10 at 50 lb";
3. try saving once with an empty field;
4. log a second session at 55 lb;
5. reload to act out coming back later;
6. check history, the chart and adding a custom exercise ("African bicep curl").

Everything entered was made-up sample data.

**How I chose the tools:**
- I first listed tools like mine: Hevy, Strong, JEFIT, FitNotes, Fitbod, Setgraph, Liftosaur, Setly,
  TrackMySet, LogMySets and wger.
- I kept only tools that run in a browser.
- Then I kept only the ones you can use without making an account. Hevy, JEFIT, wger and
  LogMySets open on a log-in or sign-up page.

The tools that were left are below. Screenshots are in [`screenshots/`](screenshots/).

## At a glance

| | Liftosaur | Setly | TrackMySet |
|---|---|---|---|
| **Setup before the app** | 4 screens: units, equipment, survey, program | None | 5 steps, ending in a required health waiver |
| **Taps to the first logged set** | 5 setup taps, then about 6 more before you can type | About 10, plus switching kg to lb | About 13, and 2 of its 3 ways to add an exercise were broken |
| **Where you land** | Empty Home screen with one hint arrow | Empty "No Routines Yet" | Empty "Ready when you are" |
| **Shows last time** | "Last: 10 × 50lb · Oct 18" plus Best, filled in for you | "Last: 50 lb" hint, but the fields start at 0 | "Last session · 10/10/10 · 50 lb" |
| **Suggests a next weight** | Only inside a program | No | No |
| **Form errors** | None: saved 0 × 0 and −5 lb | None: saved empty sets and −5 lb | None: saved "abc" and empty reps |
| **Weight chart** | Max weight and volume, **paywalled** | Best weight per day, labelled kg even after switching to lb | Total of all sets' weight, no axes |
| **History by day** | Feed of workout cards on Home | Calendar with dots, tap a day | Calendar that files evening workouts under the next day (UTC) |
| **Custom exercise** | Me → Exercises, or from the exercise search | Exercises tab only | Every exercise is typed in by hand |
| **Coming back** | Straight to Home: week strip, records marked 🏆 | Says a finished workout is still in progress | Splash screen every visit, then XP and streaks |

## Liftosaur ([liftosaur.com/app](https://www.liftosaur.com/app))

- **First visit:**
  - Story-style slides with **Get started** or **I have an account**.
  - Then units, an equipment checklist (whose defaults don't fit a normal gym), a "how did you
    hear about us" survey, and a choice of program. Picking **Go without program** gets you to
    an empty Home screen.
  - Home has one hint, "Tap here to start a workout", with an arrow pointing at the Workout
    button. The tour is hidden in a menu.
- **Logging:**
  - Search for an exercise, add it, then add a set.
  - Each new set copies the previous one as grey placeholders, so one tap confirms it.
  - The second time, it shows **"Last: 10 × 50lb · Oct 18"** and **"Best"** right under the set.
  - Finishing shows a summary with new personal records ("55 lb, was 50 lb").
- **Errors:**
  - Nothing is checked when you log: 0 reps × 0 lb and −5 lb were both saved.
  - The only message is "Name cannot be empty" on the new-exercise form, and it shows before
    you've typed anything.
- **Coming back:**
  - Opens straight to Home, with a week strip, a "Next workout" card and dated workout cards.
  - **The weight-over-time chart needs Premium.** Your own data shows blurred behind "Get Premium
    to unlock Graphs".

## Setly ([setly.app](https://www.setly.app/))

- **First visit:**
  - Opens straight into the app on **"No Routines Yet"**, with one **Create Routine** button.
  - **You have to build a routine before you can log anything.** That's about 10 taps to one set,
    and the default unit is kg.
- **Logging:**
  - A live session with a timer.
  - Set rows start at 0, with a **"Last: 50 lb"** hint under each field.
  - **Add Set** copies the previous row.
  - There's no date picker.
- **Errors:**
  - Empty sets and −5 lb were saved.
  - "Create Routine" just looks greyed out until you add a name and an exercise, with no reason
    given.
  - The only warning is a pop-up when you finish with exercises you haven't ticked off.
- **Coming back:**
  - The data is still there.
  - But it said "You have an active workout session in progress" for a workout that was already
    finished.
- **Chart and history:**
  - The Progress chart plots best weight per day plus volume, but it still says "kg" after you
    switch to lb.
  - The Calendar has dots on workout days and streak cards, and tapping a day lists its workouts.

## TrackMySet ([trackmyset.com](https://trackmyset.com/))

- **First visit:**
  - A splash with one **Start** button and "Free web app · data stays on this device".
  - Then five setup steps: start fresh or upload a backup; optional name, weight and birthday;
    pre-filled goals for workouts, calories, sleep, reading and meditation; pick a program; a
    **required health/liability waiver**.
  - With the waiver unticked, "Complete setup" does nothing and shows no message.
  - Reloading partway through setup starts it over.
- **Logging:**
  - There's no exercise library. You type every exercise in.
  - Two of the three ways to add one were broken. One threw an error but saved anyway, which
    duplicated the exercise.
  - Typing reps once fills every set.
  - The second time, it shows **"Last session · 10/10/10 · 50 lb"**.
- **Errors:** none anywhere. It saved "abc" as a weight and empty reps.
- **Coming back:**
  - The splash shows every time.
  - Rewards are a weekly streak, XP and levels, and achievements.
  - The history calendar filed evening workouts under the next day (it uses UTC dates).
  - The "chart" is a bare line of the sets' weights added together, with no axes.

## What I'm using in Plate Log

**Borrow:**
1. **Last time's numbers under the set you're logging, already filled in** (Liftosaur), so one
   tap confirms a set. Typing reps once fills every set (TrackMySet).
2. **A "new best" comparison when you save:** "55 lb, was 50 lb" (Liftosaur).
3. **A calendar or week strip with a streak** (Setly). It works as the history by day and as a
   reason to come back.
4. **"Saved on this device"** near the main action (TrackMySet). It fits a tool with no account.
5. **Adding a custom exercise right from where you need it** (Liftosaur).

**Avoid:**
1. Setup screens, surveys and waivers before the first log. Plate Log opens with my routine
   already loaded and asks one thing: which day am I doing?
2. Requiring a routine before you can log one exercise (Setly).
3. Saving invalid input silently, or greying out buttons with no reason given. Every Plate Log
   error sits next to its field and says what to do.
4. Wrong units, wrong dates, or a chart behind a paywall. Plate Log uses lb, local dates, and a
   free max-weight chart with labelled axes.

**Gaps none of them filled:**
- none suggests a next weight;
- none shows a single form error;
- none draws a free, plain chart of max weight per session.
