import assert from "node:assert/strict";
import test from "node:test";
import { chartScale, labelIndexes } from "../lib/chart.ts";

test("the y axis covers the data in 5 lb steps with room above and below", () => {
  assert.deepEqual(chartScale([50, 55]), { min: 45, max: 60, ticks: [45, 50, 55, 60] });
  assert.deepEqual(chartScale([52.5]), { min: 45, max: 60, ticks: [45, 50, 55, 60] });
});

test("the y axis never goes below zero", () => {
  assert.equal(chartScale([2.5, 5]).min, 0);
});

test("a wide range uses bigger steps so there are at most 6 ticks", () => {
  const { min, max, ticks } = chartScale([20, 135]);
  assert.ok(ticks.length <= 6, `${ticks.length} ticks`);
  assert.equal(ticks[0], min);
  assert.equal(ticks.at(-1), max);
  assert.ok(min <= 20 && max >= 135);
  assert.ok(ticks.every((tick) => tick % 5 === 0));
});

test("date labels thin out to about six, always keeping the first and last", () => {
  assert.deepEqual(labelIndexes(3), [0, 1, 2]);
  const many = labelIndexes(20);
  assert.ok(many.length <= 7);
  assert.equal(many[0], 0);
  assert.equal(many.at(-1), 19);
  assert.deepEqual(labelIndexes(0), []);
});
