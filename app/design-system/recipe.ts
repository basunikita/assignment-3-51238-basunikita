export type FrozenState = "hover" | "focus" | "pressed";
export type BadgeTone = "today" | "done" | "upper" | "legs" | "cardio" | "rest";

// A mood's styling for every part of every component, as Tailwind class strings.
export type Recipe = {
  focus: string;
  label: string;
  hint: string;
  pageTitle: string;
  sectionTitle: string;
  sectionNumber: string;
  panel: string;
  swatch: string;
  button: { base: string; primary: string; secondary: string };
  link: string;
  field: string;
  fieldLabel: string;
  checkbox: string;
  checkmark: string;
  radio: string;
  choiceLabel: string;
  toggle: { track: string; thumb: string };
  tabs: { list: string; tab: string; panel: string };
  chipGroup: string;
  chip: string;
  card: { root: string; band: string; body: string; eyebrow: string; title: string; meta: string };
  rows: { list: string; item: string; row: string; name: string; sets: string };
  badge: { base: string; tones: Record<BadgeTone, string> };
  dialog: { root: string; preview: string; title: string; close: string; facts: string; cues: string };
  timer: { root: string; label: string; digits: string };
  progress: { track: string; fill: string };
  tracker: { root: string; title: string; count: string };
  uiState: { root: string; icon: string; text: string };
  typeRoles: { role: string; sample: string; className: string; spec: string }[];
  shape: {
    corners: { label: string; className: string }[];
    border: string;
    borderLabel: string;
    shadow: string;
    shadowLabel: string;
  };
  // [text token, background token] pairs this recipe sets text in; each must reach 4.5:1.
  textPairs: [string, string][];
};
