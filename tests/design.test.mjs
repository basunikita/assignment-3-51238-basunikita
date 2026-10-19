import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";
import { PLATE_ROOM_RECIPE } from "../app/design-system/recipes/plate-room.ts";

const ROOT = new URL("..", import.meta.url).pathname;

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

const files = sourceFiles(join(ROOT, "app")).map((path) => ({ path: relative(ROOT, path), text: readFileSync(path, "utf8") }));

test("the app has source files to check", () => {
  assert.ok(files.length > 0);
});

// Tailwind's @theme inline emits no --color-* variables, so they would resolve to nothing.
test("no source reads a --color-* variable", () => {
  for (const { path, text } of files) assert.ok(!text.includes("var(--color-"), path);
});

// A bare `transition` animates outline-color too, which flashes the focus ring.
test("no class string uses a bare transition utility", () => {
  for (const { path, text } of files) assert.doesNotMatch(text, /["'`\s]transition["'`\s]/, path);
});

test("only the theme file holds hex colors", () => {
  for (const { path, text } of files) {
    if (path === "app/theme.ts") continue;
    assert.doesNotMatch(text, /#[0-9A-Fa-f]{6}\b/, path);
  }
});

test("disabled form controls don't change on hover", () => {
  const parts = {
    field: PLATE_ROOM_RECIPE.field,
    checkbox: PLATE_ROOM_RECIPE.checkbox,
    radio: PLATE_ROOM_RECIPE.radio,
    "toggle.track": PLATE_ROOM_RECIPE.toggle.track,
    chip: PLATE_ROOM_RECIPE.chip,
  };
  for (const [part, classes] of Object.entries(parts)) {
    for (const utility of classes.split(/\s+/).filter((c) => c.includes("hover-state:"))) {
      assert.ok(utility.startsWith("enabled:"), `${part}: ${utility}`);
    }
  }
});
