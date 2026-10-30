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

## Deploying

- **Client:** Vercel project with Root Directory `typing_Speed/client` (Next.js preset, keep "Include files outside the root directory" on, because the client imports `../shared`). Set `NEXT_PUBLIC_API_URL` to `https://<api-host>/api`, then redeploy.
- **API on Vercel (what we use):** a second Vercel project with Root Directory `typing_Speed/server` (Framework: Other; `api/index.js` + `vercel.json` wrap the Express app). Env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`. The API URL is then `https://<project>.vercel.app/api`.
- **API alternative:** Render (see `render.yaml`) or Railway, with a MongoDB Atlas database. Env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (the Vercel URL, no trailing slash) and `NODE_ENV=production`. In Atlas, allow the host's IPs under Network Access.
- Production cookies are `SameSite=None; Secure`, so the API must be served over HTTPS.

## Running locally (once built)

```bash
npm install            # installs root, client and server
npm run dev            # client on http://localhost:3000, API on http://localhost:5000
```

Tests: `npm test` (scoring unit tests, plus API tests that need a local MongoDB).

Copy `server/.env.example` → `server/.env` and `client/.env.example` → `client/.env.local`, then fill in `MONGODB_URI` and `JWT_SECRET`.
