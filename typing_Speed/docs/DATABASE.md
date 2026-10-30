# Database (MongoDB + Mongoose)

Back to [PLAN.md](../PLAN.md)

Database name: `typing_speed`. Three collections: `users`, `testattempts`, `practicesessions`. Word banks and passages are static JSON files in `server/data/`, not database collections.

---

## 1. User

```js
const UserSchema = new Schema({
  name:         { type: String, required: true, trim: true, maxlength: 40 },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  passedLevels: { type: [String], default: [] },          // e.g. ["beginner", "easy"]
  settings: {
    theme:    { type: String, enum: ["dark", "light"], default: "dark" },
    sound:    { type: Boolean, default: false },
    fontSize: { type: String, enum: ["sm", "md", "lg"], default: "md" },
  },
  // running totals so the dashboard doesn't need a full scan
  stats: {
    testsCompleted:   { type: Number, default: 0 },
    practiceSessions: { type: Number, default: 0 },
    timeTypingMs:     { type: Number, default: 0 },
  },
}, { timestamps: true });
```

Indexes: `{ email: 1 }` unique.

Locked levels aren't stored. They're worked out from `passedLevels` + `shared/levels.js`.

---

## 2. TestAttempt

```js
const TestAttemptSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  level:     { type: String, required: true },
  duration:  { type: Number, enum: [60, 180, 300], required: true },   // seconds
  seed:      { type: String, required: true },
  text:      { type: String, required: true },
  status:    { type: String, enum: ["started", "completed", "abandoned", "flagged"], default: "started" },
  flagReason:{ type: String },

  startedAt:   { type: Date, default: Date.now },   // when /start was called
  submittedAt: { type: Date },

  keystrokes: { type: [{ k: String, t: Number, _id: false }], select: false },

  netWpm:      Number,
  rawWpm:      Number,
  accuracy:    Number,
  consistency: Number,
  chars: { correct: Number, incorrect: Number, extra: Number, missed: Number },
  errorsByKey: { type: Map, of: Number },
  wpmPerSecond:[{ s: Number, net: Number, raw: Number, errors: Number, _id: false }],
  levelPassed: { type: Boolean, default: false },
}, { timestamps: true });
```

**Indexes**
| Index | Used by |
|---|---|
| `{ user: 1, createdAt: -1 }` | History, progress chart |
| `{ user: 1, level: 1, duration: 1, netWpm: -1 }` | Personal bests |
| `{ level: 1, duration: 1, status: 1, netWpm: -1 }` | Leaderboard |
| `{ status: 1, startedAt: 1 }` | Cleanup job for stale `started` attempts |

**Cleanup:** attempts still `started` after 1 hour are set to `abandoned` (runs on server start and every hour via `setInterval`).

**Keystroke log** has `select: false` so it's only loaded for scoring. Optional: after 90 days, clear `keystrokes` and `text` on old attempts to save space (the scores stay).

---

## 3. PracticeSession

```js
const PracticeSessionSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: "User", required: true },
  level:       { type: String, required: true },
  option:      { type: String, required: true },     // "time:30", "words:50", "passage", "untimed", "weak-drill"
  netWpm:      Number,
  rawWpm:      Number,
  accuracy:    Number,
  durationMs:  Number,
  charsTyped:  Number,
  errorsByKey: { type: Map, of: Number },
  imported:    { type: Boolean, default: false },    // true if imported from guest history
}, { timestamps: true });
```

Indexes: `{ user: 1, createdAt: -1 }`.

---

## 4. Key queries

**Leaderboard (best per user):**
```js
TestAttempt.aggregate([
  { $match: { level, duration, status: "completed", ...(week && { createdAt: { $gte: weekAgo } }) } },
  { $sort: { netWpm: -1, accuracy: -1 } },
  { $group: { _id: "$user", netWpm: { $first: "$netWpm" }, accuracy: { $first: "$accuracy" },
              testId: { $first: "$_id" }, date: { $first: "$createdAt" } } },
  { $sort: { netWpm: -1, accuracy: -1 } },
  { $limit: limit },
  { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
  { $project: { name: { $first: "$u.name" }, netWpm: 1, accuracy: 1, testId: 1, date: 1 } },
]);
```

**Weak keys (last 30 days):** sum `errorsByKey` across tests + practice sessions, divide by how often each key appeared in the text typed, sort by error rate. Keys that appeared fewer than 20 times are skipped so one-off mistakes don't dominate.

**Progress chart:** group completed tests by day (`$dateToString`), average `netWpm` and `accuracy`.

---

## 5. Deleting an account

`DELETE /users/me` removes the user and all their `testattempts` and `practicesessions` in one go (`deleteMany` on each, then the user).
