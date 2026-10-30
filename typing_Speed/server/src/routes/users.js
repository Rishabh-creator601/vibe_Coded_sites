import { Router } from "express";
import { z } from "zod";
import { LEVEL_IDS } from "../../../shared/levels.js";
import TestAttempt from "../models/TestAttempt.js";
import PracticeSession from "../models/PracticeSession.js";
import User, { publicUser } from "../models/User.js";
import { clearAuthCookie, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/common.js";
import { asyncHandler } from "../utils/http.js";
import { weakKeys } from "../services/stats.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/me/stats",
  asyncHandler(async (req, res) => {
    const uid = req.user._id;
    const [best, last10] = await Promise.all([
      TestAttempt.aggregate([
        { $match: { user: uid, status: "completed" } },
        { $sort: { netWpm: -1, accuracy: -1 } },
        { $group: { _id: { level: "$level", duration: "$duration" }, netWpm: { $first: "$netWpm" }, accuracy: { $first: "$accuracy" }, testId: { $first: "$_id" } } },
        { $project: { _id: 0, level: "$_id.level", duration: "$_id.duration", netWpm: 1, accuracy: 1, testId: 1 } },
      ]),
      TestAttempt.find({ user: uid, status: "completed" }).sort({ createdAt: -1 }).limit(10).select("netWpm accuracy"),
    ]);
    const avg = (key) => (last10.length ? last10.reduce((a, t) => a + t[key], 0) / last10.length : null);
    res.json({
      totals: { tests: req.user.stats.testsCompleted, practiceSessions: req.user.stats.practiceSessions, timeTypingMs: req.user.stats.timeTypingMs },
      best,
      last10: { avgNetWpm: avg("netWpm"), avgAccuracy: avg("accuracy") },
    });
  }),
);

const historyQuery = z.object({
  type: z.enum(["test", "practice"]).optional(),
  level: z.enum(LEVEL_IDS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

router.get(
  "/me/history",
  validate(historyQuery, "query"),
  asyncHandler(async (req, res) => {
    const { type, level, page, limit } = req.query;
    const uid = req.user._id;
    const filter = { user: uid, ...(level && { level }) };
    const want = (t) => !type || type === t;
    const take = page * limit;
    const [tests, practice, testCount, practiceCount] = await Promise.all([
      want("test") ? TestAttempt.find({ ...filter, status: { $in: ["completed", "flagged"] } }).sort({ createdAt: -1 }).limit(take).select("level duration status netWpm accuracy createdAt") : [],
      want("practice") ? PracticeSession.find(filter).sort({ createdAt: -1 }).limit(take).select("level option netWpm accuracy createdAt") : [],
      want("test") ? TestAttempt.countDocuments({ ...filter, status: { $in: ["completed", "flagged"] } }) : 0,
      want("practice") ? PracticeSession.countDocuments(filter) : 0,
    ]);
    const items = [
      ...tests.map((t) => ({ type: "test", id: t.id, level: t.level, duration: t.duration, status: t.status, netWpm: t.netWpm, accuracy: t.accuracy, createdAt: t.createdAt })),
      ...practice.map((p) => ({ type: "practice", id: p.id, level: p.level, option: p.option, netWpm: p.netWpm, accuracy: p.accuracy, createdAt: p.createdAt })),
    ]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((page - 1) * limit, page * limit);
    res.json({ items, page, limit, total: testCount + practiceCount });
  }),
);

router.get(
  "/me/progress",
  validate(z.object({ days: z.enum(["30", "90", "365"]).default("30") }), "query"),
  asyncHandler(async (req, res) => {
    const since = new Date(Date.now() - Number(req.query.days) * 86400000);
    const days = await TestAttempt.aggregate([
      { $match: { user: req.user._id, status: "completed", createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, netWpm: { $avg: "$netWpm" }, accuracy: { $avg: "$accuracy" }, tests: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", netWpm: 1, accuracy: 1, tests: 1 } },
    ]);
    res.json({ days });
  }),
);

router.get(
  "/me/weak-keys",
  asyncHandler(async (req, res) => {
    const { keys, charsTyped } = await weakKeys(req.user._id);
    res.json({ keys, charsTyped, enoughData: charsTyped >= 300 });
  }),
);

const patchSchema = z
  .object({
    name: z.string().trim().min(2).max(40),
    settings: z
      .object({ theme: z.enum(["dark", "light"]), sound: z.boolean(), fontSize: z.enum(["sm", "md", "lg"]) })
      .partial(),
  })
  .partial();

router.patch(
  "/me",
  validate(patchSchema),
  asyncHandler(async (req, res) => {
    const { name, settings } = req.body;
    if (name) req.user.name = name;
    if (settings) for (const [k, v] of Object.entries(settings)) req.user.settings[k] = v;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  }),
);

router.delete(
  "/me",
  asyncHandler(async (req, res) => {
    await Promise.all([TestAttempt.deleteMany({ user: req.user._id }), PracticeSession.deleteMany({ user: req.user._id })]);
    await User.deleteOne({ _id: req.user._id });
    clearAuthCookie(res);
    res.json({ ok: true });
  }),
);

export default router;
