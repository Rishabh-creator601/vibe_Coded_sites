// Text generation for every level (see docs/LEVELS.md). Seeded, so a given seed always gives the same text.
import { randomBytes } from "node:crypto";
// Static JSON imports (not readFileSync) so serverless bundlers always include the data files.
import WORDS_200 from "../../data/words-200.json" with { type: "json" };
import WORDS_1000 from "../../data/words-1000.json" with { type: "json" };
import SENTENCES from "../../data/sentences.json" with { type: "json" };
import RAW_PASSAGES from "../../data/passages.json" with { type: "json" };
import NUMBERS from "../../data/numbers.json" with { type: "json" };
import BEGINNER from "../../data/beginner.json" with { type: "json" };
import CODE_JS from "../../data/code/js.json" with { type: "json" };
import CODE_PYTHON from "../../data/code/python.json" with { type: "json" };

const PASSAGES = RAW_PASSAGES.map((p) => ({ ...p, words: p.text.split(" ").length }));
const CODE = { js: CODE_JS, python: CODE_PYTHON };

const CONTRACTIONS = ["don't", "it's", "I'm", "can't", "won't", "that's", "they're", "we're", "you're", "didn't", "isn't", "let's"];

export const BEGINNER_STAGES = Object.keys(BEGINNER.stages);
export const CODE_LANGS = ["js", "python"];

export const newSeed = () => randomBytes(3).toString("hex");

function hash(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

/** mulberry32 seeded from a string. */
function rng(seed) {
  let a = hash(String(seed))();
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const cap = (w) => w[0].toUpperCase() + w.slice(1);
const countWords = (s) => s.split(/\s+/).filter(Boolean).length;

function shuffled(rand, list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Items in shuffled order, reshuffling when the list runs out, until `enough(list)` is true. */
function takeUntil(rand, items, enough) {
  const out = [];
  while (!enough(out)) out.push(...shuffled(rand, items));
  return out;
}

/** n words from a bank, never the same word twice in a row. */
function randomWords(rand, bank, n) {
  const out = [];
  while (out.length < n) {
    const w = pick(rand, bank);
    if (w !== out[out.length - 1]) out.push(w);
  }
  return out;
}

function beginnerWords(rand, stage, n) {
  if (stage === "1d") return randomWords(rand, WORDS_200, n);
  const keys = BEGINNER.stages[stage].keys;
  const allowed = new Set(keys);
  const real = WORDS_1000.filter((w) => w.length >= 2 && w.length <= 5 && [...w].every((c) => allowed.has(c)));
  const letters = [...keys];
  const out = [];
  while (out.length < n) {
    let w;
    if (real.length > 0 && rand() < 0.4) w = pick(rand, real);
    else {
      const len = 2 + Math.floor(rand() * 4);
      w = Array.from({ length: len }, () => pick(rand, letters)).join("");
    }
    if (w !== out[out.length - 1]) out.push(w);
  }
  return out;
}

function mediumWords(rand, n) {
  const out = [];
  let startOfSentence = true;
  let sinceStop = 0;
  const target = 6 + Math.floor(rand() * 7);
  let sentenceLen = target;
  while (out.length < n) {
    let w = rand() < 0.07 ? pick(rand, CONTRACTIONS) : pick(rand, WORDS_1000);
    if (w === out[out.length - 1]) continue;
    if (startOfSentence || rand() < 0.12) w = cap(w);
    startOfSentence = false;
    sinceStop++;
    const end = sinceStop >= sentenceLen || out.length === n - 1;
    if (end) {
      w += rand() < 0.1 ? "?" : ".";
      startOfSentence = true;
      sinceStop = 0;
      sentenceLen = 6 + Math.floor(rand() * 7);
    } else if (sinceStop > 3 && rand() < 0.12) w += ",";
    out.push(w);
  }
  return out;
}

function numberTokens(rand, n) {
  const digits = (len) => Array.from({ length: len }, (_, i) => (i === 0 ? 1 + Math.floor(rand() * 9) : Math.floor(rand() * 10))).join("");
  const pad = (v) => String(v).padStart(2, "0");
  const fill = {
    n1: () => digits(1),
    n2: () => digits(2),
    n3: () => digits(3),
    n4: () => digits(4),
    d2: () => pad(Math.floor(rand() * 100)),
    dd: () => pad(1 + Math.floor(rand() * 28)),
    mm: () => pad(1 + Math.floor(rand() * 12)),
    yy: () => pad(20 + Math.floor(rand() * 10)),
    h: () => String(1 + Math.floor(rand() * 12)),
    min: () => pad(Math.floor(rand() * 60)),
    w: () => pick(rand, WORDS_200),
  };
  const out = [];
  while (out.length < n) {
    const tpl = pick(rand, NUMBERS.templates);
    const tok = tpl.replace(/\$\{(\w+)\}/g, (_, k) => fill[k]());
    if (tok !== out[out.length - 1]) out.push(tok);
  }
  return out;
}

function sentenceText(rand, wordCount, sentenceLimit) {
  const picked = takeUntil(rand, SENTENCES, (l) => (sentenceLimit ? l.length >= sentenceLimit : countWords(l.join(" ")) >= wordCount));
  return sentenceLimit ? picked.slice(0, sentenceLimit).join(" ") : trimToWords(picked.join(" "), wordCount);
}

function trimToWords(text, n) {
  return text.split(" ").slice(0, n).join(" ");
}

function snippetText(rand, lang, wordCount, single) {
  const pool = lang === "js" ? CODE.js : lang === "python" ? CODE.python : [...CODE.js, ...CODE.python];
  if (single) return pick(rand, pool).lines.join("\n");
  const out = [];
  let count = 0;
  while (count < wordCount) {
    for (const s of shuffled(rand, pool)) {
      out.push(s.lines.join("\n"));
      count += countWords(s.lines.join(" "));
      if (count >= wordCount) break;
    }
  }
  return out.join("\n");
}

/**
 * Generate text for a level.
 * @param {object} o
 * @param {string} o.level
 * @param {number} [o.words]    target word count (word levels) / minimum words (code)
 * @param {boolean} [o.passage] a "passage": a short fixed-size piece (one passage/snippet for Expert/Code)
 * @param {string} [o.stage]    Beginner stage 1a-1d
 * @param {string} [o.lang]     Code: js | python | both
 * @param {string} [o.seed]
 * @returns {{ level: string, seed: string, text: string, source: string | null }}
 */
export function generateText({ level, words = 50, passage = false, stage = BEGINNER.default, lang = "both", seed } = {}) {
  seed = seed || newSeed();
  const rand = rng(`${level}:${stage}:${lang}:${seed}`);
  const n = passage ? 40 : words;
  let text;
  let source = null;

  switch (level) {
    case "beginner":
      text = beginnerWords(rand, BEGINNER.stages[stage] ? stage : BEGINNER.default, n).join(" ");
      break;
    case "easy":
      text = randomWords(rand, WORDS_200, n).join(" ");
      break;
    case "medium":
      text = mediumWords(rand, n).join(" ");
      break;
    case "hard":
      text = sentenceText(rand, n, passage ? 4 : 0);
      break;
    case "expert": {
      const used = passage
        ? [pick(rand, PASSAGES)]
        : takeUntil(rand, PASSAGES, (l) => l.reduce((a, p) => a + p.words, 0) >= n);
      const joined = used.map((p) => p.text).join(" ");
      text = passage ? joined : trimToWords(joined, n);
      source = [...new Set(used.map((p) => p.source))].join("; ");
      break;
    }
    case "numbers":
      text = numberTokens(rand, n).join(" ");
      break;
    case "code":
      text = snippetText(rand, CODE_LANGS.includes(lang) ? lang : "both", n, passage);
      break;
    default:
      throw new Error(`Unknown level: ${level}`);
  }
  return { level, seed, text, source };
}

/** Practice text built around weak keys: about half the words contain at least one of them. */
export function drillText(keys, { words = 50, seed } = {}) {
  seed = seed || newSeed();
  const rand = rng(`drill:${keys.join("")}:${seed}`);
  const bank = [...new Set([...WORDS_1000, ...SENTENCES.join(" ").split(" "), ...PASSAGES.flatMap((p) => p.text.split(" "))])];
  const targeted = bank.filter((w) => keys.some((k) => w.includes(k)));
  const out = [];
  while (out.length < words) {
    const pool = targeted.length > 0 && rand() < 0.5 ? targeted : WORDS_200;
    const w = pick(rand, pool);
    if (w !== out[out.length - 1]) out.push(w);
  }
  return { seed, text: out.join(" "), keys };
}

export const wordBank = (level) => (level === "easy" ? WORDS_200 : level === "medium" ? WORDS_1000 : null);
