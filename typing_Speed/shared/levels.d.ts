export interface LevelDef {
  id: string;
  order: number;
  name: string;
  passWpm: number;
  passAcc: number;
  requires: string | null;
}
export const LEVELS: LevelDef[];
export const LEVEL_IDS: string[];
export const TEST_DURATIONS: number[];
export function getLevel(id: string): LevelDef | null;
export function isUnlocked(id: string, passedLevels?: string[]): boolean;
export function meetsTarget(id: string, netWpm: number, accuracy: number): boolean;
export function newlyUnlockedBy(id: string, passedBefore?: string[]): string[];
export function testWordCount(durationSec: number): number;
