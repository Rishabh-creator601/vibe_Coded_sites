import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { LEVEL_IDS, TEST_DURATIONS, getLevel, isUnlocked, meetsTarget, newlyUnlockedBy, testWordCount } from "../../../shared/levels.js";
import { replay } from "../../../shared/scoring.js";
import TestAttempt from "../models/TestAttempt.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { testStartLimiter, validate } from "../middleware/common.js";
import { AppError, asyncHandler, notFound } from "../utils/http.js";
import { generateText, newSeed } from "../services/textGen.js";
import { detectCheating } from "../services/antiCheat.js";
import { decodeKeys, encodeKeys } from "../utils/keymap.js";
import { config } from "../config.js";

const router = Router();

const startSchema = z.object({
  level: z.enum(LEVEL_IDS),
  duration: z.number().refine((d) => TEST_DURATIONS.includes(d), "Duration must be 60, 180 or 300 seconds"),
});
const submitSchema = z.object({
  keystrokes: z.array(z.object({ k: z.string().min(1).max(16), t: z.number() })).min(1).max(20000),
});

async function findAttempt(id, select = "") {
  if (!mongoose.isValidObjectId(id)) throw notFound("Test not found");
  const attempt = await TestAttempt.findById(id).select(select);
  if (!attempt) throw notFound("Test not found");
  return attempt;
}

router.post(
  "/start",
  requireAuth,
  testStartLimiter,
  validate(startSchema),
  asyncHandler(async (req, res) => {
    const { level, duration } = req.body;
    if (!isUnlocked(level, req.user.passedLevels)) {
      throw new AppError(403, "LEVEL_LOCKED", `Pass ${getLevel(getLevel(level).requires).name} to unlock ${getLevel(level).name}`);
    }
    // only one live test per user
    await TestAttempt.updateMany({ user: req.user._id, status: "started" }, { status: "abandoned" });
    const seed = newSeed();
    const { text } = generateText({ level, words: testWordCount(duration), stage: "1d", lang: "both", seed });
    const attempt = await TestAttempt.create({ user: req.user._id, level, duration, seed, text });
    res.status(201).json({ testId: attempt.id, level, duration, text });
  }),
);

router.post(
  "/:id/submit",
  requireAuth,
  validate(submitSchema),
  asyncHandler(async (req, res) => {
    const attempt = await findAttempt(req.params.id, "+keystrokes");
    if (!attempt.user.equals(req.user._id)) throw new AppError(403, "FORBIDDEN", "This test belongs to someone else");
    if (attempt.status !== "started") throw new AppError(409, "ALREADY_SUBMITTED", "This test was already submitted");

    const now = Date.now();
    const deadline = attempt.startedAt.getTime() + (config.testStartGraceSec + attempt.duration + 60) * 1000;
    if (now > deadline) {
      attempt.status = "abandoned";
      await attempt.save();
      throw new AppError(410, "TEST_EXPIRED", "This test has expired, start a new one");
    }

    const result = replay(attempt.text, req.body.keystrokes, { code: attempt.level === "code", durationMs: attempt.duration * 1000 });
    if (result.error) throw new AppError(400, "VALIDATION_ERROR", result.error);
    const { stats, used, elapsedMs } = result;

    const flagReason = detectCheating({ keystrokes: used, netWpm: stats.netWpm, serverElapsedMs: now - attempt.startedAt.getTime() });
    const completed = !flagReason;
    const levelPassed = completed && meetsTarget(attempt.level, stats.netWpm, stats.accuracy);
    const newlyUnlocked = levelPassed ? newlyUnlockedBy(attempt.level, req.user.passedLevels) : [];

    let personalBest = false;
    if (completed) {
      const best = await TestAttempt.findOne({ user: req.user._id, level: attempt.level, duration: attempt.duration, status: "completed" })
        .sort({ netWpm: -1 })
        .select("netWpm");
      personalBest = !best || stats.netWpm > best.netWpm;
    }

    Object.assign(attempt, {
      status: completed ? "completed" : "flagged",
      flagReason: flagReason || undefined,
      submittedAt: new Date(now),
      keystrokes: used,
      netWpm: stats.netWpm,
      rawWpm: stats.rawWpm,
      accuracy: stats.accuracy,
      consistency: stats.consistency,
      chars: stats.chars,
      errorsByKey: encodeKeys(stats.errorsByKey),
      keyCounts: encodeKeys(stats.keyCounts),
      wpmPerSecond: stats.wpmPerSecond,
      levelPassed,
      newlyUnlocked,
      personalBest,
    });
    await attempt.save();

    const update = { $inc: { "stats.timeTypingMs": elapsedMs, ...(completed && { "stats.testsCompleted": 1 }) } };
    if (levelPassed) update.$addToSet = { passedLevels: attempt.level };
    await User.updateOne({ _id: req.user._id }, update);

    res.json({ result: serialize(attempt) });
  }),
);

router.post(
  "/:id/abandon",
  requireAuth,
  asyncHandler(async (req, res) => {
    const attempt = await findAttempt(req.params.id);
    if (!attempt.user.equals(req.user._id)) throw new AppError(403, "FORBIDDEN", "This test belongs to someone else");
    if (attempt.status === "started") {
      attempt.status = "abandoned";
      await attempt.save();
    }
    res.json({ ok: true });
  }),
);

// Public: powers the shareable result page. The keystroke log is never returned.
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const attempt = await findAttempt(req.params.id);
    if (!["completed", "flagged"].includes(attempt.status)) throw notFound("Test not found");
    const owner = await User.findById(attempt.user).select("name");
    res.json({ result: { ...serialize(attempt), userName: owner?.name ?? "Unknown", date: attempt.submittedAt || attempt.createdAt } });
  }),
);

function serialize(a) {
  const level = getLevel(a.level);
  return {
    id: a.id,
    status: a.status,
    flagReason: a.status === "flagged" ? a.flagReason : undefined,
    level: a.level,
    levelName: level.name,
    passWpm: level.passWpm,
    passAcc: level.passAcc,
    duration: a.duration,
    netWpm: a.netWpm,
    rawWpm: a.rawWpm,
    accuracy: a.accuracy,
    consistency: a.consistency,
    chars: a.chars,
    errorsByKey: decodeKeys(a.errorsByKey),
    wpmPerSecond: a.wpmPerSecond,
    levelPassed: a.levelPassed,
    newlyUnlocked: a.newlyUnlocked,
    personalBest: a.personalBest,
  };
}

export default router;
