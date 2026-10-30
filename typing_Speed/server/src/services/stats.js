import PracticeSession from "../models/PracticeSession.js";
import TestAttempt from "../models/TestAttempt.js";
import { decodeKeys, mergeCounts } from "../utils/keymap.js";

const MIN_APPEARANCES = 20; // keys seen fewer times than this are skipped

/** Error rate per key over the last 30 days (tests + practice), worst first. */
export async function weakKeys(userId, days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  const [tests, sessions] = await Promise.all([
    TestAttempt.find({ user: userId, status: "completed", createdAt: { $gte: since } }).select("errorsByKey keyCounts chars"),
    PracticeSession.find({ user: userId, createdAt: { $gte: since } }).select("errorsByKey keyCounts charsTyped"),
  ]);
  const errors = {};
  const counts = {};
  let charsTyped = 0;
  for (const d of [...tests, ...sessions]) {
    mergeCounts(errors, decodeKeys(d.errorsByKey));
    mergeCounts(counts, decodeKeys(d.keyCounts));
    charsTyped += d.charsTyped ?? (d.chars ? d.chars.correct + d.chars.incorrect : 0);
  }
  const keys = Object.keys(counts)
    .filter((k) => counts[k] >= MIN_APPEARANCES && k.trim() !== "")
    .map((key) => ({ key, errors: errors[key] || 0, count: counts[key], rate: (errors[key] || 0) / counts[key] }))
    .filter((k) => k.errors > 0)
    .sort((a, b) => b.rate - a.rate);
  return { keys, charsTyped };
}
