// Builds a keystroke log that types `text` perfectly (optionally with a typo per N words).
// Used by tests only. Gaps are jittered so the result doesn't look robotic to the anti-cheat checks.
import { parseText } from "./scoring.js";

export function synthLog(text, { code = false, gapMs = 120, jitter = 60, typoEvery = 0, maxMs = Infinity, seed = 1 } = {}) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const { words, seps } = parseText(text, code);
  const log = [];
  let t = 0;
  const push = (k) => {
    log.push({ k, t: Math.round(t) });
    t += gapMs + (rand() - 0.5) * 2 * jitter;
  };
  for (let i = 0; i < words.length; i++) {
    const word = words[i].expected;
    if (typoEvery && i % typoEvery === typoEvery - 1) {
      push(word[0] === "q" ? "w" : "q"); // wrong first char, fixed with backspace
      push("Backspace");
    }
    for (const ch of word) {
      if (t > maxMs) return log;
      push(ch);
    }
    if (i < words.length - 1) push(seps[i] === "\n" ? "Enter" : " ");
  }
  return log;
}
