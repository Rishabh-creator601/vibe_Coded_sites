import type { PracticeRecord, WeakKey } from "@/types";

const HISTORY_KEY = "ts_practice_history";
const DECLINED_KEY = "ts_import_declined";
const MAX = 50;

function read(): PracticeRecord[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export const getHistory = () => (typeof window === "undefined" ? [] : read());

export function addPractice(rec: PracticeRecord) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([rec, ...read()].slice(0, MAX)));
}

export const clearHistory = () => localStorage.removeItem(HISTORY_KEY);
export const importDeclined = () => localStorage.getItem(DECLINED_KEY) === "1";
export const declineImport = () => localStorage.setItem(DECLINED_KEY, "1");

export function bestLocalWpm(level: string): number | null {
  const wpms = getHistory().filter((r) => r.level === level).map((r) => r.netWpm);
  return wpms.length ? Math.max(...wpms) : null;
}

/** Weak keys from the guest's own history (same rules as the server: 20+ appearances). */
export function localWeakKeys(): { keys: WeakKey[]; charsTyped: number } {
  const errors: Record<string, number> = {};
  const counts: Record<string, number> = {};
  let charsTyped = 0;
  for (const r of getHistory()) {
    charsTyped += r.charsTyped;
    for (const [k, v] of Object.entries(r.errorsByKey)) errors[k] = (errors[k] || 0) + v;
    for (const [k, v] of Object.entries(r.keyCounts ?? {})) counts[k] = (counts[k] || 0) + v;
  }
  const keys = Object.keys(counts)
    .filter((k) => counts[k] >= 20 && k.trim() && errors[k] > 0)
    .map((key) => ({ key, errors: errors[key], count: counts[key], rate: errors[key] / counts[key] }))
    .sort((a, b) => b.rate - a.rate);
  return { keys, charsTyped };
}
