import { Router } from "express";
import { z } from "zod";
import { LEVEL_IDS } from "../../../shared/levels.js";
import PracticeSession from "../models/PracticeSession.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/common.js";
import { AppError, asyncHandler } from "../utils/http.js";
import { BEGINNER_STAGES, CODE_LANGS, drillText, generateText, wordBank } from "../services/textGen.js";
import { encodeKeys } from "../utils/keymap.js";
import { weakKeys } from "../services/stats.js";

const router = Router();

const levelParam = (req, _res, next) =>
  LEVEL_IDS.includes(req.params.level) ? next() : next(new AppError(404, "NOT_FOUND", "Unknown level"));

const textQuery = z.object({
  words: z.coerce.number().int().min(5).max(1000).default(50),
  passage: z.enum(["0", "1"]).default("0"),
  stage: z.enum(BEGINNER_STAGES).default("1d"),
  lang: z.enum([...CODE_LANGS, "both"]).default("both"),
  seed: z.string().max(20).optional(),
});

router.get("/:level/text", levelParam, validate(textQuery, "query"), (req, res) => {
  const { words, passage, stage, lang, seed } = req.query;
  res.json(generateText({ level: req.params.level, words, passage: passage === "1", stage, lang, seed }));
});

router.get("/:level/wordbank", levelParam, (req, res) => {
  const bank = wordBank(req.params.level);
  if (!bank) throw new AppError(404, "NOT_FOUND", "This level has no word bank");
  res.set("Cache-Control", "public, max-age=86400").json({ words: bank });
});

const countMap = z.record(z.string().min(1).max(2), z.number().int().min(0).max(100000)).refine((o) => Object.keys(o).length <= 120, "Too many keys");
const sessionSchema = z.object({
  level: z.enum(LEVEL_IDS),
  option: z.string().regex(/^(time:\d{1,3}|words:\d{1,4}|passage|untimed|weak-drill)$/, "Unknown option"),
  netWpm: z.number().min(0).max(400),
  rawWpm: z.number().min(0).max(400),
  accuracy: z.number().min(0).max(100),
  durationMs: z.number().min(0).max(3_600_000),
  charsTyped: z.number().int().min(0).max(100000),
  errorsByKey: countMap.default({}),
  keyCounts: countMap.default({}),
});

const toDoc = (userId, s, extra = {}) => ({ ...s, user: userId, errorsByKey: encodeKeys(s.errorsByKey), keyCounts: encodeKeys(s.keyCounts), ...extra });

router.post(
  "/sessions",
  requireAuth,
  validate(sessionSchema),
  asyncHandler(async (req, res) => {
    const s = await PracticeSession.create(toDoc(req.user._id, req.body));
    await User.updateOne({ _id: req.user._id }, { $inc: { "stats.practiceSessions": 1, "stats.timeTypingMs": req.body.durationMs } });
    res.status(201).json({ session: { id: s.id, createdAt: s.createdAt } });
  }),
);

router.post(
  "/sessions/import",
  requireAuth,
  validate(z.object({ sessions: z.array(sessionSchema.extend({ createdAt: z.coerce.date().optional() })).max(50) })),
  asyncHandler(async (req, res) => {
    const docs = req.body.sessions.map((s) => toDoc(req.user._id, s, { imported: true }));
    if (docs.length) {
      await PracticeSession.insertMany(docs);
      await User.updateOne(
        { _id: req.user._id },
        { $inc: { "stats.practiceSessions": docs.length, "stats.timeTypingMs": docs.reduce((a, d) => a + d.durationMs, 0) } },
      );
    }
    res.status(201).json({ imported: docs.length });
  }),
);

const MIN_DRILL_CHARS = 300;

// Build a drill from explicit keys (works for guests, whose history lives in the browser).
router.get(
  "/drill",
  validate(z.object({ keys: z.string().min(1).max(40), seed: z.string().max(20).optional() }), "query"),
  (req, res) => {
    const keys = [...new Set(req.query.keys.split(","))].filter(Boolean).slice(0, 5);
    res.json(drillText(keys, { seed: req.query.seed }));
  },
);

// Same, but picks the logged-in user's own top 5 weak keys.
router.get(
  "/weak-drill",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { keys, charsTyped } = await weakKeys(req.user._id);
    if (charsTyped < MIN_DRILL_CHARS || keys.length === 0) {
      throw new AppError(400, "VALIDATION_ERROR", "Type a bit more so we can find your weak keys");
    }
    res.json(drillText(keys.slice(0, 5).map((k) => k.key)));
  }),
);

export default router;
