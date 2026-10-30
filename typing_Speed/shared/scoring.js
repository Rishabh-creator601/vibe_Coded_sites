// Typing engine + scoring. Used by the browser (live typing) and by the server
// (replaying a test's keystroke log), so both sides get identical numbers.
// See docs/SCORING.md.

export const MAX_EXTRA = 10; // max extra chars typed past the end of one word

/** Split text into words. In code mode newlines become word separators and indentation is not typed. */
export function parseText(text, code = false) {
  const words = [];
  const seps = [];
  if (code) {
    text.split("\n").forEach((line, li) => {
      const indent = line.length - line.trimStart().length;
      const tokens = line.trim().split(" ").filter(Boolean);
      tokens.forEach((tok, ti) => {
        words.push({ expected: tok, indent: ti === 0 ? indent : 0, lineStart: ti === 0 && li > 0 });
        seps.push(" ");
      });
      if (tokens.length) seps[seps.length - 1] = "\n";
    });
  } else {
    text
      .split(" ")
      .filter(Boolean)
      .forEach((tok) => {
        words.push({ expected: tok, indent: 0, lineStart: false });
        seps.push(" ");
      });
  }
  if (seps.length) seps[seps.length - 1] = "";
  return { words, seps };
}

export const isValidKey = (k) =>
  typeof k === "string" && (k.length === 1 || k === "Backspace" || k === "Ctrl+Backspace" || k === "Enter");

const bump = (obj, key) => {
  obj[key] = (obj[key] || 0) + 1;
};

export class Engine {
  constructor(text, { code = false } = {}) {
    this.text = text;
    this.code = code;
    const { words, seps } = parseText(text, code);
    this.words = words;
    this.seps = seps;
    this.typed = words.map(() => "");
    this.wordIndex = 0;
    this.status = "idle"; // idle | running | finished
    this.keystrokes = []; // { k, t } - everything accepted, Backspace included
    this.events = []; // { t, ok } - one per scored keystroke
    this.correctKeystrokes = 0;
    this.totalKeystrokes = 0;
    this.errorsByKey = {}; // keyed by the EXPECTED char
    this.keyCounts = {}; // how often each expected char was attempted
  }

  hasError(i) {
    return this.typed[i] !== this.words[i].expected;
  }

  /** Feed one key. Returns true if the engine accepted it (and logged it). */
  press(key, t) {
    if (this.status === "finished" || this.words.length === 0) return false;
    const w = this.wordIndex;
    const word = this.words[w].expected;
    const typed = this.typed[w];
    const last = w === this.words.length - 1;

    if (key === "Backspace" || key === "Ctrl+Backspace") {
      if (typed.length === 0) {
        if (!(w > 0 && this.hasError(w - 1))) return false;
        this.wordIndex = w - 1; // only back into a word that has an error
      }
      const i = this.wordIndex;
      this.typed[i] = key === "Ctrl+Backspace" ? "" : this.typed[i].slice(0, -1);
      return this.#accept(key, t);
    }

    const advance = key === " " || (this.code && key === "Enter");
    if (advance) {
      if (typed.length === 0 || last) return false;
      const sepOk = key === " " ? this.seps[w] !== "\n" : this.seps[w] === "\n";
      const ok = typed.length >= word.length && sepOk;
      this.totalKeystrokes++;
      if (ok) this.correctKeystrokes++;
      else if (typed.length < word.length) bump(this.errorsByKey, word[typed.length]);
      this.events.push({ t, ok });
      this.wordIndex = w + 1;
      return this.#accept(key, t);
    }

    if (key.length !== 1 || typed.length >= word.length + MAX_EXTRA) return false;
    const expected = word[typed.length];
    const ok = key === expected;
    this.totalKeystrokes++;
    if (ok) this.correctKeystrokes++;
    if (expected !== undefined) {
      bump(this.keyCounts, expected);
      if (!ok) bump(this.errorsByKey, expected);
    }
    this.events.push({ t, ok });
    this.typed[w] = typed + key;
    const accepted = this.#accept(key, t);
    if (last && this.typed[w].length === word.length) this.status = "finished";
    return accepted;
  }

  #accept(key, t) {
    if (this.status === "idle") this.status = "running";
    this.keystrokes.push({ k: key, t });
    return true;
  }

  finish() {
    this.status = "finished";
  }

  /** Character totals for the text as it currently stands. */
  chars() {
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;
    this.words.forEach((w, i) => {
      const typed = this.typed[i];
      const passed = i < this.wordIndex;
      const n = Math.min(typed.length, w.expected.length);
      for (let j = 0; j < n; j++) typed[j] === w.expected[j] ? correct++ : incorrect++;
      extra += Math.max(0, typed.length - w.expected.length);
      if (passed) {
        missed += Math.max(0, w.expected.length - typed.length);
        if (typed === w.expected) correct++; // the space/newline that followed it
      }
    });
    return { correct, incorrect, extra, missed };
  }

  /** Light stats for the live display. */
  summary(elapsedMs) {
    const minutes = elapsedMs / 60000;
    if (this.totalKeystrokes === 0 || minutes <= 0) return { netWpm: 0, rawWpm: 0, accuracy: 0 };
    return {
      netWpm: this.chars().correct / 5 / minutes,
      rawWpm: this.totalKeystrokes / 5 / minutes,
      accuracy: (this.correctKeystrokes / this.totalKeystrokes) * 100,
    };
  }

  /** Full stats: headline numbers, character breakdown and the per-second chart series. */
  stats(elapsedMs) {
    const chars = this.chars();
    const { netWpm, rawWpm, accuracy } = this.summary(elapsedMs);
    const { wpmPerSecond, consistency } = perSecond(this.events, elapsedMs);
    return {
      netWpm,
      rawWpm,
      accuracy,
      consistency,
      chars,
      errorsByKey: { ...this.errorsByKey },
      keyCounts: { ...this.keyCounts },
      wpmPerSecond,
      totalKeystrokes: this.totalKeystrokes,
      correctKeystrokes: this.correctKeystrokes,
      elapsedMs,
    };
  }
}

/**
 * Chart series: net/raw WPM over a trailing 5-second window at the end of each second.
 * Consistency is computed from the raw 1-second buckets (instant speed), not the smoothed series.
 */
export function perSecond(events, elapsedMs) {
  const secs = Math.max(0, Math.ceil(elapsedMs / 1000));
  if (secs === 0 || events.length === 0) return { wpmPerSecond: [], consistency: 0 };
  const total = new Array(secs).fill(0);
  const good = new Array(secs).fill(0);
  const bad = new Array(secs).fill(0);
  for (const e of events) {
    const s = Math.min(secs - 1, Math.floor(e.t / 1000));
    total[s]++;
    e.ok ? good[s]++ : bad[s]++;
  }
  const wpmPerSecond = [];
  for (let s = 1; s <= secs; s++) {
    const from = Math.max(0, s - 5);
    let t = 0;
    let g = 0;
    for (let i = from; i < s; i++) {
      t += total[i];
      g += good[i];
    }
    const windowMin = (Math.min(s * 1000, elapsedMs) - from * 1000) / 60000;
    wpmPerSecond.push({
      s,
      net: windowMin > 0 ? g / 5 / windowMin : 0,
      raw: windowMin > 0 ? t / 5 / windowMin : 0,
      errors: bad[s - 1],
    });
  }
  const instant = total.map((n) => n * 12); // chars/s -> WPM
  const mean = instant.reduce((a, b) => a + b, 0) / instant.length;
  const sd = Math.sqrt(instant.reduce((a, b) => a + (b - mean) ** 2, 0) / instant.length);
  const consistency = mean > 0 ? Math.min(100, Math.max(0, 100 - (sd / mean) * 100)) : 0;
  return { wpmPerSecond, consistency };
}

/** Returns an error message if the keystroke log is malformed, else null. */
export function validateLog(keystrokes) {
  if (!Array.isArray(keystrokes) || keystrokes.length === 0) return "Keystroke log is empty";
  if (keystrokes.length > 20000) return "Keystroke log is too long";
  let prev = 0;
  for (const e of keystrokes) {
    if (!e || !isValidKey(e.k)) return "Keystroke log contains an unknown key";
    if (typeof e.t !== "number" || !Number.isFinite(e.t) || e.t < prev) return "Keystroke times must not decrease";
    prev = e.t;
  }
  return null;
}

/**
 * Replay a keystroke log against a text. With `durationMs` (tests) keystrokes after the limit are
 * dropped and the elapsed time is the full duration, unless the text was finished early.
 */
export function replay(text, keystrokes, { code = false, durationMs = null } = {}) {
  const problem = validateLog(keystrokes);
  if (problem) return { error: problem };
  const engine = new Engine(text, { code });
  const used = [];
  let lastT = 0;
  for (const e of keystrokes) {
    if (durationMs !== null && e.t > durationMs) break;
    if (engine.press(e.k, e.t)) {
      used.push(e);
      lastT = e.t;
    }
    if (engine.status === "finished") break;
  }
  const elapsedMs = engine.status === "finished" || durationMs === null ? lastT : durationMs;
  return { engine, used, elapsedMs, stats: engine.stats(elapsedMs) };
}
