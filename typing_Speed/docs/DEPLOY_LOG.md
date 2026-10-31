# Deployment log

Back to [PLAN.md](../PLAN.md). Secrets (database password, JWT secret) are never written here.

## Setup

| Part | Where | Details |
|---|---|---|
| Client (Next.js) | Vercel project `keystone-typing-speed` | Root Directory `typing_Speed/client`, Next.js preset. Live: https://keystone-typing-speed.vercel.app |
| API (Express) | Vercel project `keystone-api` | Root Directory `typing_Speed/server`, Express preset. URL: https://keystone-api-seven.vercel.app (note: `keystone-api.vercel.app` belongs to someone else) |
| Database | MongoDB Atlas, `calorie-cluster` (free, AWS Mumbai) | Database `typing_speed`, user `typing_api` (read/write). Cluster is shared with Kalorie; network access allows 0.0.0.0/0. |
| Other site | Vercel project `vibe-coded-sites` | Root Directory `saffron_and_steam/apps/web` (a different site, left unchanged) |

## What happened (30 Oct 2026)

1. `vibe-coded-sites` only builds `saffron_and_steam/apps/web`, so the typing site never showed up there. Created a separate project per app.
2. First client deploy failed: `Cannot find module 'next/dist/compiled/next-server/server.runtime.prod.js'`. Cause: `outputFileTracingRoot` in `next.config.mjs`. Removed it; redeploy succeeded.
3. Live site showed "Can't reach the server" because `NEXT_PUBLIC_API_URL` was unset (defaults to localhost). The API was not hosted yet.
4. Render sign-in failed, so the API was moved to Vercel instead.
5. Resumed the paused Atlas cluster and created the `typing_api` user.
6. API deployed, then failed twice:
   - `Invalid export found in module src/app.js`: Vercel's Express preset loads `src/app.js` as the entry and it had no default export. Fix: `src/app.js` now default-exports the app and connects to MongoDB on first request; removed `api/index.js` and `vercel.json`; word lists are static JSON imports so they are bundled.
   - `MongoDB connection failed: bad auth : authentication failed`: the password in the `MONGODB_URI` env var does not match the Atlas user.

## Still to do

- [ ] Push the code fix (`server/src/app.js`, `server/src/services/textGen.js`, deleted `api/index.js` + `vercel.json`, README, this log).
- [ ] Re-save `MONGODB_URI` in `keystone-api` (Settings, Environment Variables). Check for stray spaces or `<` `>`. If it still fails, reset the `typing_api` password in Atlas (letters and digits only) and update the env var.
- [ ] The database password was shared in chat: reset it in Atlas once everything works, then update `MONGODB_URI`.
- [ ] Verify `https://keystone-api-seven.vercel.app/api/health` returns `"db":"connected"`.
- [ ] In `keystone-typing-speed` set `NEXT_PUBLIC_API_URL` = `https://keystone-api-seven.vercel.app/api` and redeploy.
- [ ] Test on the live site: sign up, practice run, scored test, leaderboard.
- [ ] `render.yaml` is unused now (kept as an alternative host).
