import { test } from "node:test";
import assert from "node:assert/strict";
import { Engine, replay } from "./scoring.js";
import { synthLog } from "./synth.js";

// Types `keys` at a steady 100ms per key and returns the engine.
function type(text, keys, opts) {
  const e = new Engine(text, opts);
  keys.forEach((k, i) => e.press(k, i * 100));
  return e;
}
const chars = (s) => s.split("");
const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test("perfect typing: accuracy 100, net = raw", () => {
  const e = type("the cat sat", chars("the cat sat"));
  assert.equal(e.status, "finished");
  const s = e.stats(60000);
  assert.equal(s.accuracy, 100);
  assert.equal(s.netWpm, s.rawWpm);
  assert.deepEqual(s.chars, { correct: 11, incorrect: 0, extra: 0, missed: 0 });
});

test("a typo fixed with backspace: net unchanged, accuracy < 100", () => {
  const e = type("the cat", [..."thx", "Backspace", ..."e cat"]);
  const s = e.stats(60000);
  assert.equal(s.chars.correct, 7);
  assert.ok(s.accuracy < 100);
  assert.ok(s.rawWpm > s.netWpm);
});

test("a typo left in: net < raw", () => {
  const e = type("the cat", chars("thx cat"));
  const s = e.stats(60000);
  assert.equal(s.chars.incorrect, 1);
  assert.ok(s.netWpm < s.rawWpm);
});

test("space mid-word counts missed chars", () => {
  const e = type("the cat sat", chars("th cat sat"));
  const s = e.stats(60000);
  assert.equal(s.chars.missed, 1);
  assert.ok(s.accuracy < 100);
});

test("extra chars at the end of a word are counted", () => {
  const e = type("the cat", chars("thee cat"));
  const s = e.stats(60000);
  assert.equal(s.chars.extra, 1);
  assert.ok(s.netWpm < s.rawWpm);
});

test("zero keystrokes: everything is 0", () => {
  const s = new Engine("the cat").stats(0);
  assert.equal(s.netWpm, 0);
  assert.equal(s.rawWpm, 0);
  assert.equal(s.accuracy, 0);
  assert.equal(s.consistency, 0);
});

test("worked example from SCORING.md (310 keys, 295 matched, 290 correct chars)", () => {
  const e = new Engine("a");
  e.totalKeystrokes = 310;
  e.correctKeystrokes = 295;
  e.chars = () => ({ correct: 290, incorrect: 0, extra: 0, missed: 0 });
  const s = e.summary(60000);
  near(s.rawWpm, 62);
  near(s.netWpm, 58);
  near(s.accuracy, 95.16, 0.05);
});

test("backspace only goes back into a previous word that has an error", () => {
  const ok = type("ab cd", [..."ab ", "Backspace"]);
  assert.equal(ok.wordIndex, 1);
  const bad = type("ab cd", [..."ax ", "Backspace"]);
  assert.equal(bad.wordIndex, 0);
  assert.equal(bad.typed[0], "a");
});

test("space at the start of a word is ignored", () => {
  const e = type("ab cd", [" ", "a"]);
  assert.equal(e.keystrokes.length, 1);
});

test("replay drops keystrokes after the time limit and scores over the full duration", () => {
  const text = Array(200).fill("the").join(" ");
  const log = synthLog(text, { gapMs: 100, jitter: 0 });
  const r = replay(text, log, { durationMs: 10000 });
  assert.equal(r.elapsedMs, 10000);
  assert.ok(r.used.every((k) => k.t <= 10000));
  assert.ok(r.stats.netWpm > 100 && r.stats.netWpm < 130);
});

test("client and server replay give identical numbers", () => {
  const text = "the quick brown fox jumps over the lazy dog";
  const log = synthLog(text, { typoEvery: 3 });
  const live = new Engine(text);
  log.forEach((e) => live.press(e.k, e.t));
  const server = replay(text, log);
  assert.deepEqual(server.stats, live.stats(server.elapsedMs));
});

test("code level: Enter moves to the next line and indentation is not typed", () => {
  const text = "function f() {\n  return 1;\n}";
  const log = synthLog(text, { code: true });
  const r = replay(text, log, { code: true });
  assert.equal(r.engine.status, "finished");
  assert.equal(r.stats.accuracy, 100);
  assert.ok(!log.some((k) => k.k === " " && k.t === 0));
});

test("malformed logs are rejected", () => {
  assert.ok(replay("a", []).error);
  assert.ok(replay("a", [{ k: "Shift", t: 0 }]).error);
  assert.ok(replay("a", [{ k: "a", t: 50 }, { k: "b", t: 10 }]).error);
});
