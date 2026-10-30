# API (Express)

Back to [PLAN.md](../PLAN.md)

Base URL: `http://localhost:5000/api` (dev). All bodies are JSON. Auth uses an httpOnly cookie named `token`, so the client sends requests with `credentials: "include"`.

**Error format (all endpoints):**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Email is required" } }
```

| Code | HTTP |
|---|---|
| `VALIDATION_ERROR` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` / `LEVEL_LOCKED` | 403 |
| `NOT_FOUND` | 404 |
| `ALREADY_SUBMITTED` | 409 |
| `TEST_EXPIRED` | 410 |
| `RATE_LIMITED` | 429 |
| `SERVER_ERROR` | 500 |

🔒 = needs login · 🌐 = public

---

## 1. Health

| Method | Path | | Notes |
|---|---|---|---|
| GET | `/health` | 🌐 | `{ "ok": true, "db": "connected" }` |

---

## 2. Auth

| Method | Path | | Notes |
|---|---|---|---|
| POST | `/auth/register` | 🌐 | Creates user, sets cookie |
| POST | `/auth/login` | 🌐 | Sets cookie. Rate limit: 10 per 15 min per IP |
| POST | `/auth/logout` | 🔒 | Clears cookie |
| GET | `/auth/me` | 🔒 | Current user, or 401 |

**POST `/auth/register`**
```json
// request
{ "name": "Rishabh", "email": "r@example.com", "password": "min8chars" }
// response 201
{ "user": { "id": "665f...", "name": "Rishabh", "email": "r@example.com", "passedLevels": [] } }
```
Rules: name 2–40 chars, valid email (stored lowercase, unique), password 8–72 chars.

**POST `/auth/login`**: `{ email, password }` → same response as register (200).

---

## 3. Levels

**GET `/levels`** 🌐 (if logged in, includes the user's lock status)
```json
{
  "levels": [
    { "id": "beginner", "name": "Beginner", "order": 1, "passWpm": 15, "passAcc": 90,
      "locked": false, "passed": true, "bestWpm": 22.4 },
    { "id": "hard", "name": "Hard", "order": 4, "passWpm": 45, "passAcc": 94,
      "locked": true, "requires": "medium", "passed": false, "bestWpm": null }
  ]
}
```
For guests: `locked` is `false` for Beginner and `true` for the rest (Test mode only), `passed`/`bestWpm` are `null`.

---

## 4. Practice

**GET `/practice/:level/text`** 🌐
Query: `words` (default 50), `stage` (Beginner: `1a`–`1d`), `lang` (Code: `js` | `python`), `seed` (optional)
```json
{ "level": "medium", "seed": "a81f3c", "text": "The world is ...", "source": null }
```

**GET `/practice/:level/wordbank`** 🌐
Returns the word list for word-based levels so the client can generate text locally. Cached for 1 day.

**POST `/practice/sessions`** 🔒
```json
// request
{ "level": "easy", "option": "time:30", "netWpm": 41.2, "rawWpm": 44.0,
  "accuracy": 96.1, "durationMs": 30000, "charsTyped": 220,
  "errorsByKey": { "e": 3, "r": 1 } }
// response 201
{ "session": { "id": "...", "createdAt": "2026-10-30T10:00:00Z" } }
```
Practice numbers come from the client and aren't verified; practice doesn't affect unlocks or the leaderboard.

**POST `/practice/sessions/import`** 🔒
Body: `{ "sessions": [ ...up to 50 ] }`. One-time import of guest history after sign-up.

**GET `/practice/weak-drill`** 🔒
Returns text built around the user's top weak keys: `{ "keys": ["e","r",";"], "text": "..." }`

---

## 5. Tests

**POST `/tests/start`** 🔒 (rate limit: 30/hour per user)
```json
// request
{ "level": "medium", "duration": 60 }
// response 201
{ "testId": "6660...", "level": "medium", "duration": 60, "text": "..." }
```
Errors: `LEVEL_LOCKED` (403) if the user hasn't unlocked the level; `VALIDATION_ERROR` if duration isn't 60, 180 or 300.

**POST `/tests/:id/submit`** 🔒
```json
// request
{ "keystrokes": [ { "k": "T", "t": 0 }, { "k": "h", "t": 104 } ] }
// response 200
{
  "result": {
    "id": "6660...",
    "status": "completed",
    "netWpm": 52.3, "rawWpm": 55.8, "accuracy": 95.4, "consistency": 81.0,
    "chars": { "correct": 262, "incorrect": 8, "extra": 2, "missed": 4 },
    "errorsByKey": { "e": 3, ",": 2 },
    "wpmPerSecond": [ { "s": 1, "net": 48, "raw": 50, "errors": 0 } ],
    "levelPassed": true,
    "newlyUnlocked": ["hard", "numbers", "code"],
    "personalBest": true
  }
}
```
Body limit 200 KB. Errors: `ALREADY_SUBMITTED`, `TEST_EXPIRED`, `FORBIDDEN`. Flagged results return 200 with `status: "flagged"` and `flagReason`.

**POST `/tests/:id/abandon`** 🔒
Marks a started test as abandoned (called on restart or leaving the page via `navigator.sendBeacon`).

**GET `/tests/:id`** 🌐
Result details for the shareable page. Public fields only: user name, level, duration, scores, chart data, date. The keystroke log is never returned.

---

## 6. User stats

| Method | Path | | Returns |
|---|---|---|---|
| GET | `/users/me/stats` | 🔒 | Totals, best per level and duration, averages over the last 10 tests |
| GET | `/users/me/history` | 🔒 | Paginated tests + practice. Query: `type=test\|practice`, `level`, `page`, `limit` (max 50) |
| GET | `/users/me/progress` | 🔒 | Daily average net WPM for the chart. Query: `days=30\|90\|365` |
| GET | `/users/me/weak-keys` | 🔒 | Error rate per key over the last 30 days, sorted worst first |
| PATCH | `/users/me` | 🔒 | Update name and settings (theme, sound, fontSize) |
| DELETE | `/users/me` | 🔒 | Delete account and all data |

**GET `/users/me/stats`** example:
```json
{
  "totals": { "tests": 34, "practiceSessions": 120, "timeTypingMs": 5400000 },
  "best": [ { "level": "medium", "duration": 60, "netWpm": 58.1, "accuracy": 96.0, "testId": "..." } ],
  "last10": { "avgNetWpm": 51.2, "avgAccuracy": 94.8 }
}
```

---

## 7. Leaderboard

**GET `/leaderboard`** 🌐
Query: `level` (required), `duration` (60 | 180 | 300, required), `period` (`all` | `week`, default `all`), `limit` (default 50, max 100)
```json
{
  "entries": [
    { "rank": 1, "name": "Asha", "netWpm": 112.4, "accuracy": 98.1, "testId": "...", "date": "2026-10-28" }
  ],
  "me": { "rank": 37, "netWpm": 61.0 }
}
```
One entry per user (their best). Only `completed` tests count. Cached for 60 seconds.

---

## 8. Middleware order (`server/src/index.js`)

```
helmet → cors({ origin: CLIENT_URL, credentials: true }) → express.json({ limit: "200kb" })
→ cookie-parser → routes → 404 handler → errorHandler
```
`requireAuth` reads the cookie, verifies the JWT and sets `req.user`. `optionalAuth` does the same but doesn't fail for guests (used by `/levels`).
