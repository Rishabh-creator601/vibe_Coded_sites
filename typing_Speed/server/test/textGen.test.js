// AI-written practice passages. No database needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import AI_PASSAGES from "../data/ai-passages.json" with { type: "json" };
import { cleanPassage } from "../data/build-ai-passages.mjs";
import { generateText } from "../src/services/textGen.js";

const AI_SOURCE = "Written by AI (Qwen3-4B)";
const SEEDS = Array.from({ length: 300 }, (_, i) => `seed${i}`);
const filler = (n) => Array.from({ length: n }, (_, i) => `word${"abcdefghij"[i % 10]}${"klmnopqrst"[Math.floor(i / 10) % 10]}`).join(" ");
const sentence = (n) => `Start ${filler(n - 2)} end.`;

test("every saved AI passage passes the checks and is labelled", () => {
  assert.ok(AI_PASSAGES.length > 0);
  assert.equal(new Set(AI_PASSAGES.map((p) => p.id)).size, AI_PASSAGES.length);
  for (const p of AI_PASSAGES) {
    assert.deepEqual(cleanPassage(p.text), { text: p.text }, p.id);
    assert.equal(p.source, AI_SOURCE, p.id);
  }
});

test("scored tests never get AI passages", () => {
  for (const seed of SEEDS) {
    const { text, source } = generateText({ level: "expert", words: 200, seed });
    assert.ok(!source.includes(AI_SOURCE), seed);
    for (const p of AI_PASSAGES) assert.ok(!text.includes(p.text.slice(0, 40)), seed);
  }
});

test("practice can get AI passages, shown with their source", () => {
  const runs = SEEDS.map((seed) => generateText({ level: "expert", passage: true, seed, includeAi: true }));
  const ai = runs.filter((r) => r.source === AI_SOURCE);
  assert.ok(ai.length > 0);
  assert.ok(ai.length < runs.length, "real passages still appear");
  for (const r of ai) assert.ok(AI_PASSAGES.some((p) => p.text === r.text));
});

test("AI passages only affect the Expert level", () => {
  for (const level of ["easy", "medium", "hard", "numbers"]) {
    assert.deepEqual(generateText({ level, seed: "same" }), generateText({ level, seed: "same", includeAi: true }), level);
  }
});

test("cleanPassage tidies typography into typeable characters", () => {
  const { text, problem } = cleanPassage(`“${sentence(45)}”`);
  assert.equal(problem, undefined);
  assert.equal(text, sentence(45));
  assert.equal(cleanPassage(`${sentence(45).slice(0, -1)} don’t—stop…`).text, `${sentence(45).slice(0, -1)} don't - stop...`);
  assert.equal(cleanPassage(`Start\n\n${sentence(45)}`).text, `Start ${sentence(45)}`);
});

test("cleanPassage rejects text that can't be used", () => {
  const cases = {
    "too short": "This is far too short.",
    "too long": sentence(90),
    "has a number": `${sentence(45).slice(0, -1)} 42 end.`,
    "has markdown": `**Start** ${sentence(45)}`,
    "has non-keyboard characters": `${sentence(45).slice(0, -1)} café end.`,
    "no capital at the start": sentence(45).toLowerCase(),
    "no ending": sentence(45).slice(0, -1),
    "unclosed quote": `${sentence(45).slice(0, -1)} "end.`,
    "unclosed bracket": `${sentence(45).slice(0, -1)} (end.`,
    "repeated phrase": `Start one two three four five six seven eight one two three four five nine ${filler(35)} end.`,
  };
  for (const [name, input] of Object.entries(cases)) assert.ok(cleanPassage(input).problem, name);
});
