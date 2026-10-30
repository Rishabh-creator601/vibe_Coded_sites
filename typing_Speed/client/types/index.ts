import type { CharCounts, SecondPoint } from "../../shared/scoring.js";

export type Settings = { theme: "dark" | "light"; sound: boolean; fontSize: "sm" | "md" | "lg" };

export interface User {
  id: string;
  name: string;
  email: string;
  passedLevels: string[];
  settings: Settings;
}

export interface LevelInfo {
  id: string;
  name: string;
  order: number;
  passWpm: number;
  passAcc: number;
  requires: string | null;
  locked: boolean;
  passed: boolean | null;
  bestWpm: number | null;
  bestPracticeWpm: number | null;
}

/** What the results panel shows, for both practice runs and tests. */
export interface RunResult {
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  chars: CharCounts;
  errorsByKey: Record<string, number>;
  wpmPerSecond: SecondPoint[];
  durationMs: number;
}

export interface TestResult extends Omit<RunResult, "durationMs"> {
  id: string;
  status: "completed" | "flagged";
  flagReason?: string;
  level: string;
  levelName: string;
  passWpm: number;
  passAcc: number;
  duration: number;
  levelPassed: boolean;
  newlyUnlocked: string[];
  personalBest: boolean;
  userName?: string;
  date?: string;
}

export interface PracticeRecord {
  level: string;
  option: string;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  durationMs: number;
  charsTyped: number;
  errorsByKey: Record<string, number>;
  keyCounts: Record<string, number>;
  createdAt: string;
}

export interface WeakKey {
  key: string;
  errors: number;
  count: number;
  rate: number;
}

export type PracticeOption =
  | { kind: "time"; value: number }
  | { kind: "words"; value: number }
  | { kind: "passage" }
  | { kind: "untimed" };

export const optionToString = (o: PracticeOption) => (o.kind === "time" || o.kind === "words" ? `${o.kind}:${o.value}` : o.kind);
