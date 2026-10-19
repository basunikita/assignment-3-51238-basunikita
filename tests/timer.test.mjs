import assert from "node:assert/strict";
import test from "node:test";
import { formatSeconds, isRunning, newTimer, resetTimer, tick, toggleRunning } from "../app/design-system/timer.ts";

test("formats seconds as m:ss", () => {
  assert.equal(formatSeconds(90), "1:30");
  assert.equal(formatSeconds(120), "2:00");
  assert.equal(formatSeconds(65), "1:05");
  assert.equal(formatSeconds(0), "0:00");
});

test("a new timer is full and paused", () => {
  assert.deepEqual(newTimer(90), { total: 90, remaining: 90, endsAt: null });
  assert.equal(isRunning(newTimer(90)), false);
});

test("a paused timer doesn't tick", () => {
  const paused = newTimer(90);
  assert.equal(tick(paused, 5000), paused);
});

test("starting sets the end time from the clock", () => {
  const running = toggleRunning(newTimer(90), 1000);
  assert.deepEqual(running, { total: 90, remaining: 90, endsAt: 91000 });
  assert.equal(isRunning(running), true);
});

test("a running timer counts down by the clock, so a throttled or locked tab catches up", () => {
  const running = toggleRunning(newTimer(90), 0);
  assert.equal(tick(running, 1000).remaining, 89);
  assert.equal(tick(running, 30000).remaining, 60);
});

test("a part second doesn't change the display or the state", () => {
  const running = toggleRunning(newTimer(90), 0);
  assert.equal(tick(running, 500), running);
});

test("the timer stops at zero", () => {
  const running = toggleRunning(newTimer(90), 0);
  assert.deepEqual(tick(running, 90000), { total: 90, remaining: 0, endsAt: null });
  assert.deepEqual(tick(running, 200000), { total: 90, remaining: 0, endsAt: null });
});

test("toggling pauses and resumes without losing time", () => {
  const paused = toggleRunning(toggleRunning(newTimer(90), 0), 48000);
  assert.deepEqual(paused, { total: 90, remaining: 42, endsAt: null });
  assert.deepEqual(toggleRunning(paused, 100000), { total: 90, remaining: 42, endsAt: 142000 });
});

test("starting a finished timer runs it again from the top", () => {
  assert.deepEqual(toggleRunning({ total: 90, remaining: 0, endsAt: null }, 5000), { total: 90, remaining: 90, endsAt: 95000 });
});

test("reset returns to full and paused", () => {
  assert.deepEqual(resetTimer({ total: 60, remaining: 12, endsAt: 99000 }), newTimer(60));
});
