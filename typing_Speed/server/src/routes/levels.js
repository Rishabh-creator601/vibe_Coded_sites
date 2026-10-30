import { Router } from "express";
import { LEVELS, isUnlocked } from "../../../shared/levels.js";
import TestAttempt from "../models/TestAttempt.js";
import PracticeSession from "../models/PracticeSession.js";
import { optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    let testBest = {};
    let practiceBest = {};
    if (user) {
      const [tests, practice] = await Promise.all([
        TestAttempt.aggregate([{ $match: { user: user._id, status: "completed" } }, { $group: { _id: "$level", best: { $max: "$netWpm" } } }]),
        PracticeSession.aggregate([{ $match: { user: user._id } }, { $group: { _id: "$level", best: { $max: "$netWpm" } } }]),
      ]);
      testBest = Object.fromEntries(tests.map((t) => [t._id, t.best]));
      practiceBest = Object.fromEntries(practice.map((t) => [t._id, t.best]));
    }
    res.json({
      levels: LEVELS.map((l) => ({
        id: l.id,
        name: l.name,
        order: l.order,
        passWpm: l.passWpm,
        passAcc: l.passAcc,
        requires: l.requires,
        locked: user ? !isUnlocked(l.id, user.passedLevels) : l.requires !== null,
        passed: user ? user.passedLevels.includes(l.id) : null,
        bestWpm: user ? (testBest[l.id] ?? null) : null,
        bestPracticeWpm: user ? (practiceBest[l.id] ?? null) : null,
      })),
    });
  }),
);

export default router;
