// Level config shared by the client and the server (see docs/LEVELS.md).
export const LEVELS = [
  { id: "beginner", order: 1, name: "Beginner", passWpm: 15, passAcc: 90, requires: null },
  { id: "easy", order: 2, name: "Easy", passWpm: 25, passAcc: 90, requires: "beginner" },
  { id: "medium", order: 3, name: "Medium", passWpm: 35, passAcc: 92, requires: "easy" },
  { id: "hard", order: 4, name: "Hard", passWpm: 45, passAcc: 94, requires: "medium" },
  { id: "expert", order: 5, name: "Expert", passWpm: 60, passAcc: 95, requires: "hard" },
  { id: "numbers", order: 6, name: "Numbers & Symbols", passWpm: 30, passAcc: 92, requires: "medium" },
  { id: "code", order: 7, name: "Code", passWpm: 30, passAcc: 92, requires: "medium" },
];

export const LEVEL_IDS = LEVELS.map((l) => l.id);
export const TEST_DURATIONS = [60, 180, 300]; // seconds

export const getLevel = (id) => LEVELS.find((l) => l.id === id) || null;

export function isUnlocked(id, passedLevels = []) {
  const level = getLevel(id);
  if (!level) return false;
  return !level.requires || passedLevels.includes(level.requires);
}

export function meetsTarget(id, netWpm, accuracy) {
  const level = getLevel(id);
  return !!level && netWpm >= level.passWpm && accuracy >= level.passAcc;
}

/** Levels that open because `id` was passed (empty if `id` was already passed before). */
export function newlyUnlockedBy(id, passedBefore = []) {
  if (passedBefore.includes(id)) return [];
  return LEVELS.filter((l) => l.requires === id).map((l) => l.id);
}

/** Words of text to generate for a test: 200 WPM x minutes, so nobody runs out. */
export const testWordCount = (durationSec) => Math.ceil((200 * durationSec) / 60);
