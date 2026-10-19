import type { Recipe } from "../recipe";

const LABEL = "font-label text-xs font-bold uppercase tracking-[0.14em]";
const SHADOW = "shadow-[2px_2px_0_var(--swatch-ink)]";

// Square, 2 px ink outlines, a thin 2 px shadow on buttons and cards; yellow only for the primary action and on states.
export const PLATE_ROOM_RECIPE: Recipe = {
  focus: "focus-state:outline-3 focus-state:outline-offset-2 focus-state:outline-focus",
  label: `${LABEL} text-muted`,
  hint: "text-sm text-muted",
  pageTitle: "font-display text-6xl font-black uppercase leading-none sm:text-7xl",
  sectionTitle: "font-display text-4xl font-black uppercase leading-none",
  sectionNumber: "grid size-9 shrink-0 place-items-center border-2 border-ink bg-accent font-numbers text-xl text-on-accent",
  panel: "border-2 border-ink bg-surface p-5",
  swatch: "h-20 border-2 border-ink",
  button: {
    base: `inline-flex items-center justify-center gap-2 border-2 border-ink px-5 py-2 font-display text-xl font-extrabold uppercase ${SHADOW} transition-[color,background-color,border-color,box-shadow,translate,scale,filter] pressed-state:translate-x-0.5 pressed-state:translate-y-0.5 pressed-state:shadow-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40`,
    primary: "bg-accent text-on-accent hover-state:brightness-95",
    secondary: "bg-(--swatch-panel) text-ink hover-state:bg-bg",
  },
  link: "font-label text-sm font-bold uppercase tracking-[0.06em] text-ink underline decoration-2 underline-offset-4 hover-state:decoration-[3px]",
  field:
    "w-full border-2 border-control bg-(--swatch-panel) px-3 py-2 text-ink placeholder:text-muted enabled:hover-state:bg-bg disabled:cursor-not-allowed disabled:opacity-40",
  fieldLabel: LABEL,
  checkbox:
    "size-[22px] appearance-none border-2 border-control bg-(--swatch-panel) checked:bg-accent enabled:hover-state:not-checked:bg-bg disabled:cursor-not-allowed disabled:opacity-40",
  checkmark: "text-ink",
  radio:
    "size-[22px] shrink-0 appearance-none rounded-full border-2 border-control bg-(--swatch-panel) checked:border-[7px] enabled:hover-state:not-checked:bg-bg disabled:opacity-40",
  choiceLabel: "flex items-center gap-2.5 font-bold text-ink",
  toggle: {
    track:
      "group inline-flex h-[26px] w-12 shrink-0 items-center border-2 border-control bg-(--swatch-panel) transition-[color,background-color,border-color,box-shadow,translate,scale,filter] aria-checked:bg-accent enabled:hover-state:brightness-95 disabled:cursor-not-allowed disabled:opacity-40",
    thumb: "ml-[3px] size-4 bg-ink transition-[color,background-color,border-color,box-shadow,translate,scale,filter] group-aria-checked:translate-x-[22px]",
  },
  tabs: {
    list: "inline-flex border-2 border-ink",
    tab: "border-l-2 border-ink bg-(--swatch-panel) px-4 py-1.5 font-display text-lg font-extrabold uppercase text-ink first:border-l-0 hover-state:not-aria-selected:bg-bg aria-selected:bg-ink aria-selected:text-(--swatch-panel) aria-selected:focus-state:-outline-offset-5 aria-selected:focus-state:outline-(--swatch-panel)",
    panel: "pt-4 font-bold",
  },
  chipGroup: "flex flex-wrap gap-2",
  chip: "border-2 border-ink bg-(--swatch-panel) px-2.5 py-1 font-label text-xs font-bold uppercase tracking-[0.1em] text-ink enabled:hover-state:not-aria-pressed:bg-bg pressed-state:translate-y-0.5 aria-pressed:bg-ink aria-pressed:text-(--swatch-panel) disabled:cursor-not-allowed disabled:opacity-40",
  card: {
    root: `border-2 border-ink bg-surface ${SHADOW}`,
    band: "h-2 bg-[repeating-linear-gradient(-45deg,var(--swatch-safety)_0_8px,var(--swatch-ink)_8px_16px)]",
    body: "grid gap-1 p-4",
    eyebrow: `${LABEL} text-muted`,
    title: "font-display text-3xl font-black uppercase leading-none",
    meta: "font-numbers text-2xl font-extrabold",
  },
  rows: {
    list: "border-2 border-ink bg-surface",
    item: "border-b-2 border-ink last:border-b-0",
    row: "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left font-bold hover-state:bg-bg",
    name: "",
    sets: "whitespace-nowrap font-numbers text-xl font-extrabold",
  },
  badge: {
    base: "inline-flex items-center border-2 border-ink px-2 py-0.5 font-label text-[11px] font-bold uppercase tracking-[0.1em]",
    tones: {
      today: "bg-accent text-on-accent",
      done: "bg-ink text-(--swatch-panel)",
      upper: "bg-(--swatch-blue) text-(--swatch-panel)",
      legs: "bg-(--swatch-red) text-(--swatch-panel)",
      cardio: "bg-(--swatch-green) text-(--swatch-panel)",
      rest: "bg-(--swatch-panel) text-ink",
    },
  },
  dialog: {
    root: `m-auto w-[min(30rem,calc(100vw-2rem))] border-2 border-ink bg-surface p-6 text-ink ${SHADOW} backdrop:bg-ink/50`,
    preview: "border-2 border-ink bg-bg p-4",
    title: "font-display text-3xl font-black uppercase leading-none",
    close: "grid size-9 shrink-0 place-items-center border-2 border-ink font-body text-3xl font-bold leading-none hover-state:bg-bg",
    facts: "font-numbers text-2xl font-extrabold",
    cues: "list-decimal space-y-2 pl-5 font-bold",
  },
  timer: {
    root: "grid justify-items-center gap-3 border-2 border-ink bg-surface p-6",
    label: `${LABEL} text-muted`,
    digits: "font-numbers text-7xl font-extrabold",
  },
  progress: { track: "h-3 border-2 border-ink bg-(--swatch-panel)", fill: "h-full bg-accent transition-[width]" },
  tracker: { root: "grid gap-3", title: "font-display text-2xl font-extrabold uppercase", count: `${LABEL} text-muted` },
  uiState: {
    root: "grid justify-items-center gap-2 border-2 border-ink bg-surface p-5 text-center",
    icon: "size-8 text-ink",
    text: "font-bold",
  },
  typeRoles: [
    { role: "Display", sample: "Leg day", className: "font-display text-6xl font-black uppercase leading-none", spec: "Big Shoulders 900 · 60 px, uppercase" },
    { role: "Heading", sample: "Shoulders + triceps", className: "font-display text-3xl font-extrabold uppercase", spec: "Big Shoulders 800 · 30 px, uppercase" },
    {
      role: "Body",
      sample: "Three sets of ten. Rest 90 seconds between sets.",
      className: "max-w-prose text-base leading-relaxed",
      spec: "Archivo 400 · 16 px / 1.6",
    },
    { role: "Label", sample: "Rest between sets", className: LABEL, spec: "Archivo 700 · 12 px, uppercase" },
    { role: "Numbers", sample: "3 × 10", className: "font-numbers text-6xl font-extrabold", spec: "Big Shoulders Stencil 800 · 60 px" },
  ],
  shape: {
    corners: [{ label: "Square · everything", className: "rounded-none" }],
    border: "border-2 border-ink",
    borderLabel: "2 px ink outlines",
    shadow: SHADOW,
    shadowLabel: "2 px offset shadow · buttons and cards",
  },
  textPairs: [
    ["ink", "safety"],
    ["ink", "panel"],
    ["panel", "ink"],
    ["ink", "concrete"],
    ["muted", "panel"],
    ["muted", "concrete"],
    ["panel", "blue"],
    ["panel", "red"],
    ["panel", "green"],
  ],
};
