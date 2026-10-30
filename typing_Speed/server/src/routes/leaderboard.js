import { Router } from "express";
import { z } from "zod";
import { LEVEL_IDS, TEST_DURATIONS } from "../../../shared/levels.js";
import TestAttempt from "../models/TestAttempt.js";
import User from "../models/User.js";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/common.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

const query = z.object({
  level: z.enum(LEVEL_IDS),
  duration: z.coerce.number().refine((d) => TEST_DURATIONS.includes(d), "Duration must be 60, 180 or 300"),
  period: z.enum(["all", "week"]).default("all"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const cache = new Map(); // key -> { at, ranked }
const TTL_MS = 60 * 1000;

async function ranking({ level, duration, period }) {
  const key = `${level}:${duration}:${period}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.ranked;
  const ranked = await TestAttempt.aggregate([
    { $match: { level, duration, status: "completed", ...(period === "week" && { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } }) } },
    { $sort: { netWpm: -1, accuracy: -1 } },
    { $group: { _id: "$user", netWpm: { $first: "$netWpm" }, accuracy: { $first: "$accuracy" }, testId: { $first: "$_id" }, date: { $first: "$createdAt" } } },
    { $sort: { netWpm: -1, accuracy: -1 } },
  ]);
  cache.set(key, { at: Date.now(), ranked });
  return ranked;
}

router.get(
  "/",
  optionalAuth,
  validate(query, "query"),
  asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const ranked = await ranking(req.query);
    const top = ranked.slice(0, limit);
    const users = await User.find({ _id: { $in: top.map((r) => r._id) } }).select("name");
    const names = new Map(users.map((u) => [u.id, u.name]));
    const entries = top.map((r, i) => ({
      rank: i + 1,
      name: names.get(String(r._id)) ?? "Unknown",
      netWpm: r.netWpm,
      accuracy: r.accuracy,
      testId: r.testId,
      date: r.date.toISOString().slice(0, 10),
    }));
    let me = null;
    if (req.user) {
      const i = ranked.findIndex((r) => r._id.equals(req.user._id));
      if (i >= 0) me = { rank: i + 1, netWpm: ranked[i].netWpm };
    }
    res.json({ entries, me });
  }),
);

export default router;
