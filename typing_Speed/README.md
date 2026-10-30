# Typing Speed

A typing speed website that measures **words per minute (WPM)** and **accuracy** across 7 levels, with a **Practice** mode for learning and a **Test** mode for scored, saved attempts.

**Stack:** Next.js · Node.js + Express · MongoDB Atlas
**Status:** built (phases 1-7 of [`PLAN.md`](PLAN.md)); deployment (phase 8) not done.

## Features (planned)

- 7 levels: Beginner (row drills), Easy, Medium, Hard, Expert, Numbers & Symbols, Code
- **Practice:** timed, word-count, passage or untimed runs, live feedback, weak-keys drill
- **Test:** 1 / 3 / 5 minute server-issued tests, scored on the server, unlock the next level
- Results with WPM-over-time chart and missed-key heatmap
- Dashboard with personal bests, progress and history
- Leaderboard per level and duration

## Docs

| File | Contents |
|---|---|
| [`PLAN.md`](PLAN.md) | Overview, decisions, folder structure, build phases |
| [`docs/LEVELS.md`](docs/LEVELS.md) | Levels, text content, unlock rules |
| [`docs/MODES.md`](docs/MODES.md) | Practice vs Test |
| [`docs/SCORING.md`](docs/SCORING.md) | Typing engine, formulas, anti-cheat |
| [`docs/API.md`](docs/API.md) | Express endpoints |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Mongoose models and queries |
| [`docs/PAGES.md`](docs/PAGES.md) | Routes, components, design |

## Running locally (once built)

```bash
npm install            # installs root, client and server
npm run dev            # client on http://localhost:3000, API on http://localhost:5000
```

Tests: `npm test` (scoring unit tests, plus API tests that need a local MongoDB).

Copy `server/.env.example` → `server/.env` and `client/.env.example` → `client/.env.local`, then fill in `MONGODB_URI` and `JWT_SECRET`.
