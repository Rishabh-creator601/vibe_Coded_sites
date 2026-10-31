# Typing Speed (Keystone)

A typing speed website that measures **words per minute (WPM)** and **accuracy** across 7 levels, with a **Practice** mode for learning and a **Test** mode for scored, saved attempts.

**Stack:** Next.js 15 (App Router, TypeScript, Tailwind 4) · Node.js + Express · MongoDB Atlas
**Live site:** https://keystone-typing-speed.vercel.app
**Status:** built (phases 1-7 of [`PLAN.md`](PLAN.md)) and deployed on Vercel. See [`docs/DEPLOY_LOG.md`](docs/DEPLOY_LOG.md) for the deployment history and open items.

## Features

- 7 levels: Beginner (row drills), Easy, Medium, Hard, Expert, Numbers & Symbols, Code
- **Practice** (open to everyone): time, word-count, passage or untimed runs, live WPM and accuracy, weak-keys drill, optional on-screen keyboard. Guests keep history in the browser.
- **Test** (login required): 1 / 3 / 5 minute server-issued tests, scored on the server from the keystroke log, with anti-cheat checks. Passing a level unlocks the next ones.
- Results with a WPM-over-time chart and a missed-key heatmap, plus a shareable result page
- Dashboard with personal bests, progress chart, weak keys and history
- Leaderboard per level, duration and period (all time / this week)
- Dark and light themes, text size and sound settings

## Project layout

```
client/    Next.js app (port 3000)
server/    Express API (port 5000), word banks and passages in server/data/
shared/    Level config and the typing/scoring engine, used by both client and server
docs/      Detailed plans (see below)
```

`shared/` is why the browser's live numbers and the server's final test score always agree: both run the same code.

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
| [`docs/DEPLOY_LOG.md`](docs/DEPLOY_LOG.md) | What is deployed where, what went wrong, what is left |

## Running locally

Needs Node 20+ and a MongoDB (a local install, or an Atlas connection string).

```bash
npm install            # installs root, client and server
npm run dev            # client on http://localhost:3000, API on http://localhost:5000
```

Copy `server/.env.example` → `server/.env` and `client/.env.example` → `client/.env.local`, then set `MONGODB_URI` and `JWT_SECRET`. On Windows, `start.bat` does the install and starts both apps.

| Variable | Where | Meaning |
|---|---|---|
| `MONGODB_URI` | server | MongoDB connection string (database `typing_speed`) |
| `JWT_SECRET` | server | Signs login cookies. Use a long random string, never a password |
| `JWT_EXPIRES_IN` | server | Login lifetime, default `7d` |
| `CLIENT_URL` | server | Site origin allowed by CORS, no trailing slash |
| `NODE_ENV` | server | `production` makes cookies `SameSite=None; Secure` |
| `NEXT_PUBLIC_API_URL` | client | API base URL ending in `/api` |

## Tests

```bash
npm test
```

Runs the scoring unit tests in `shared/` and the end-to-end API tests in `server/test/`. The API tests need MongoDB on `127.0.0.1:27017` and use a throwaway database, `typing_speed_test`.

## Deploying (Vercel + MongoDB Atlas)

The site and the API are **two separate Vercel projects** from the same GitHub repo, because the repo holds several unrelated sites and each Vercel project builds one Root Directory.

| Project | Root Directory | Preset | Env vars |
|---|---|---|---|
| Site | `typing_Speed/client` | Next.js | `NEXT_PUBLIC_API_URL` = `https://<api-project>.vercel.app/api` |
| API | `typing_Speed/server` | Express | `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production` |

Steps:
1. **Atlas:** create a database user limited to `typing_speed` (read/write), allow network access (`0.0.0.0/0` works for Vercel's changing IPs), and copy the `mongodb+srv://…` string. If the password contains special characters, URL-encode them or pick letters and digits only.
2. **API project:** import the repo, set the Root Directory and the four env vars above, deploy. Check `https://<api-project>.vercel.app/api/health`: it should say `"db":"connected"`.
3. **Site project:** import the repo, set the Root Directory (keep "Include files outside the root directory" on, because the client imports `../shared`), add `NEXT_PUBLIC_API_URL`, deploy.

How the API runs on Vercel: the Express preset loads `server/src/app.js`, which default-exports the app and connects to MongoDB on the first request. Guest practice text needs no database, so it keeps working if Atlas is down.

Alternative API hosts: `render.yaml` is a ready Render blueprint.

### Gotchas

- **`NEXT_PUBLIC_*` values are baked in at build time.** After changing one, redeploy the site; the old build keeps the old value.
- **Don't set `outputFileTracingRoot`** in `client/next.config.mjs`. It made the Vercel build fail with `Cannot find module 'next/dist/compiled/next-server/server.runtime.prod.js'`.
- **One Vercel project per site.** A project whose Root Directory points at another site (e.g. `saffron_and_steam/apps/web`) will never show this one.
- **Login-only pages across domains:** the site and API live on different domains, so `client/middleware.ts` can't see the login cookie there. It only redirects in local dev; on Vercel the client-side `RequireLogin` guard does it.
- **`bad auth : authentication failed`** in the API's runtime logs means the password in `MONGODB_URI` doesn't match the Atlas user.
- Vercel asks for an authenticator code when you deploy or redeploy; that is Vercel's 2FA, not an error.
