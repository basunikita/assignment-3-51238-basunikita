// The Plate Room look from Assignment 2 (app/moods.ts there), the only theme this app uses.

export type Swatch = {
  token: string;
  name: string;
  hex: string;
  role: string;
};

type ColorRole = "bg" | "surface" | "ink" | "muted" | "line" | "accent" | "on-accent" | "focus" | "control";
type FontRole = "display" | "body" | "label" | "numbers";

export type Mood = {
  name: string;
  swatches: Swatch[];
  // Each color role names a swatch token.
  roles: Record<ColorRole, string>;
  // CSS font-family values; the variables come from app/fonts.ts.
  fonts: Record<FontRole, string>;
  radius: string;
  // [text token, background token] pairs the app sets text in; each must reach 4.5:1.
  textPairs: [string, string][];
};

export const PLATE_ROOM: Mood = {
  name: "Plate Room",
  swatches: [
    { token: "safety", name: "Safety", hex: "#FFD400", role: "Action" },
    { token: "ink", name: "Ink", hex: "#121212", role: "Text" },
    { token: "red", name: "Red", hex: "#D7262D", role: "Legs" },
    { token: "blue", name: "Blue", hex: "#1F5FBF", role: "Upper body" },
    { token: "green", name: "Green", hex: "#187A43", role: "Cardio" },
    { token: "concrete", name: "Concrete", hex: "#E9E8E4", role: "Background" },
    { token: "panel", name: "Panel", hex: "#FFFFFF", role: "Surface" },
    { token: "steel", name: "Steel", hex: "#BDBBB4", role: "Border" },
    { token: "muted", name: "Muted", hex: "#55534E", role: "Muted text" },
  ],
  roles: {
    bg: "concrete",
    surface: "panel",
    ink: "ink",
    muted: "muted",
    line: "steel",
    accent: "safety",
    "on-accent": "ink",
    focus: "ink",
    control: "ink",
  },
  fonts: {
    display: "var(--font-big-shoulders)",
    body: "var(--font-archivo)",
    label: "var(--font-archivo)",
    numbers: "var(--font-big-shoulders-stencil)",
  },
  radius: "0px",
  textPairs: [
    ["ink", "concrete"],
    ["ink", "panel"],
    ["muted", "panel"],
    ["muted", "concrete"],
    ["ink", "safety"],
    ["panel", "red"],
    ["panel", "blue"],
    ["panel", "green"],
    ["panel", "ink"],
    ["ink", "steel"],
  ],
};

export function getSwatch(mood: Mood, token: string): Swatch {
  const swatch = mood.swatches.find((candidate) => candidate.token === token);
  if (!swatch) throw new Error(`${mood.name} has no swatch "${token}"`);
  return swatch;
}

// CSS variables for the root element; app/globals.css maps them to Tailwind tokens.
export function moodStyle(mood: Mood): Record<string, string> {
  const vars: Record<string, string> = { "--mood-radius": mood.radius };
  for (const swatch of mood.swatches) vars[`--swatch-${swatch.token}`] = swatch.hex;
  for (const [role, token] of Object.entries(mood.roles)) vars[`--mood-${role}`] = `var(--swatch-${token})`;
  for (const [role, family] of Object.entries(mood.fonts)) vars[`--mood-font-${role}`] = family;
  return vars;
}
