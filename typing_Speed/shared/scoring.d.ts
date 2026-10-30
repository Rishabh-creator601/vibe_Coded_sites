export type CharCounts = { correct: number; incorrect: number; extra: number; missed: number };
export type SecondPoint = { s: number; net: number; raw: number; errors: number };
export type Keystroke = { k: string; t: number };

export interface Stats {
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  chars: CharCounts;
  errorsByKey: Record<string, number>;
  keyCounts: Record<string, number>;
  wpmPerSecond: SecondPoint[];
  totalKeystrokes: number;
  correctKeystrokes: number;
  elapsedMs: number;
}

export interface WordInfo {
  expected: string;
  indent: number;
  lineStart: boolean;
}

export const MAX_EXTRA: number;
export function parseText(text: string, code?: boolean): { words: WordInfo[]; seps: string[] };
export function isValidKey(k: unknown): boolean;
export function perSecond(
  events: { t: number; ok: boolean }[],
  elapsedMs: number,
): { wpmPerSecond: SecondPoint[]; consistency: number };
export function validateLog(keystrokes: unknown): string | null;

export class Engine {
  constructor(text: string, opts?: { code?: boolean });
  text: string;
  code: boolean;
  words: WordInfo[];
  seps: string[];
  typed: string[];
  wordIndex: number;
  status: "idle" | "running" | "finished";
  keystrokes: Keystroke[];
  events: { t: number; ok: boolean }[];
  correctKeystrokes: number;
  totalKeystrokes: number;
  errorsByKey: Record<string, number>;
  keyCounts: Record<string, number>;
  hasError(i: number): boolean;
  press(key: string, t: number): boolean;
  finish(): void;
  chars(): CharCounts;
  summary(elapsedMs: number): { netWpm: number; rawWpm: number; accuracy: number };
  stats(elapsedMs: number): Stats;
}

export function replay(
  text: string,
  keystrokes: unknown,
  opts?: { code?: boolean; durationMs?: number | null },
): { error: string } | { engine: Engine; used: Keystroke[]; elapsedMs: number; stats: Stats; error?: undefined };
