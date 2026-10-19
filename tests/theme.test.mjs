import assert from "node:assert/strict";
import test from "node:test";
import { contrast } from "../app/design-system/contrast.ts";
import { PLATE_ROOM_RECIPE } from "../app/design-system/recipes/plate-room.ts";
import { getSwatch, PLATE_ROOM } from "../app/theme.ts";

const hex = (token) => getSwatch(PLATE_ROOM, token).hex;

test("contrast matches known WCAG values", () => {
  assert.equal(contrast("#000000", "#FFFFFF").toFixed(1), "21.0");
  assert.equal(contrast("#FFD400", "#FFFFFF").toFixed(1), "1.4");
});

test("every role names one of the swatches", () => {
  for (const token of Object.values(PLATE_ROOM.roles)) getSwatch(PLATE_ROOM, token);
});

test("core role pairs reach 4.5:1", () => {
  const { roles } = PLATE_ROOM;
  const pairs = [
    [roles.ink, roles.bg],
    [roles.muted, roles.bg],
    [roles.ink, roles.surface],
    [roles["on-accent"], roles.accent],
  ];
  for (const [text, background] of pairs) {
    const ratio = contrast(hex(text), hex(background));
    assert.ok(ratio >= 4.5, `${text} on ${background} is ${ratio.toFixed(2)}:1`);
  }
});

test("the keyboard focus ring reaches 3:1 against the page", () => {
  const ratio = contrast(hex(PLATE_ROOM.roles.focus), hex(PLATE_ROOM.roles.bg));
  assert.ok(ratio >= 3, `focus is ${ratio.toFixed(2)}:1`);
});

test("control outlines reach 3:1 against the page", () => {
  const ratio = contrast(hex(PLATE_ROOM.roles.control), hex(PLATE_ROOM.roles.bg));
  assert.ok(ratio >= 3, `control is ${ratio.toFixed(2)}:1`);
});

test("every text pair the recipe uses is declared and reaches 4.5:1", () => {
  const declared = new Set(PLATE_ROOM.textPairs.map(([text, background]) => `${text}/${background}`));
  for (const [text, background] of PLATE_ROOM_RECIPE.textPairs) {
    assert.ok(declared.has(`${text}/${background}`), `${text} on ${background} is not declared`);
    const ratio = contrast(hex(text), hex(background));
    assert.ok(ratio >= 4.5, `${text} on ${background} is ${ratio.toFixed(2)}:1`);
  }
});

test("every declared text pair reaches 4.5:1", () => {
  for (const [text, background] of PLATE_ROOM.textPairs) {
    const ratio = contrast(hex(text), hex(background));
    assert.ok(ratio >= 4.5, `${text} on ${background} is ${ratio.toFixed(2)}:1`);
  }
});

test("white text on each plate color reaches 4.5:1", () => {
  for (const token of ["blue", "red", "green"]) {
    const ratio = contrast("#FFFFFF", hex(token));
    assert.ok(ratio >= 4.5, `white on ${token} is ${ratio.toFixed(2)}:1`);
  }
});
