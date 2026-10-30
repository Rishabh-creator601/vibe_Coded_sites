# Typing Speed Website: End-to-End Plan

**Stack:** Next.js (frontend) · Node.js + Express (backend API) · MongoDB Atlas (database)
**What it does:** measures typing speed (WPM) and accuracy across 7 levels, with a **Practice** mode for learning and a **Test** mode for scored attempts
**Status:** planning (30 Oct 2026). No code yet.
**Folder:** `Vibe-coded-sites/typing_Speed/`

This file is the overview. Detailed plans live in `docs/`:

| File | What's in it |
|---|---|
| [`docs/LEVELS.md`](docs/LEVELS.md) | The 7 levels, what text each one uses, unlock rules, word-bank format |
| [`docs/MODES.md`](docs/MODES.md) | Practice vs Test: options, flows, what gets saved, the weak-keys drill |
| [`docs/SCORING.md`](docs/SCORING.md) | The typing engine, WPM/accuracy formulas, edge cases, anti-cheat checks |
| [`docs/API.md`](docs/API.md) | Every Express endpoint, with request and response shapes |
| [`docs/DATABASE.md`](docs/DATABASE.md) | MongoDB/Mongoose models and indexes |
| [`docs/PAGES.md`](docs/PAGES.md) | Next.js routes, components, UI states, keyboard shortcuts, design |

---

## 0. Decisions so far (30 Oct 2026)

| Topic | Decision |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express REST API under `/api` |
| Database | MongoDB Atlas + Mongoose (same as Kalorie) |
| Auth | Email + password, bcrypt hashing, JWT in an httpOnly cookie |
| Levels | 7: Beginner, Easy, Medium, Hard, Expert, Numbers & Symbols, Code |
| Modes | **Practice** (open to everyone, all levels) and **Test** (login required, scored) |
| Test durations | 1, 3 and 5 minutes |
| Scoring | Server recalculates every test score from the keystroke log; client numbers are never trusted |
| Leaderboard | Yes, per level and per duration (phase 7) |

---

## 1. Goals

1. A typing site where anyone can **pick a level → type → see their WPM and accuracy** right away.
2. **Practice mode**: relaxed, with live feedback, any level and the option to drill your weakest keys.
3. **Test mode**: a fixed-length, server-issued test whose score is saved, unlocks the next level and counts for the leaderboard.
4. A **dashboard** showing progress over time, best scores per level and a weak-key heatmap.
5. A clean, documented full-stack codebase that works as a portfolio project.

**Non-goals for v1:** multiplayer races, languages other than English, custom user-uploaded texts, a mobile app, payments.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS | Routing, SSR for landing/leaderboard pages, fast UI work |
| Charts | Recharts | WPM-over-time and progress graphs |
| Backend | Express 4 on Node 20 | Simple REST API, matches the other projects |
| Database | MongoDB Atlas + Mongoose | Flexible docs for keystroke logs and per-key stats |
| Auth | bcrypt + jsonwebtoken + cookie-parser | httpOnly cookie keeps the token out of JS |
| Validation | zod (server) | Validate every request body |
| Security | helmet, cors, express-rate-limit | Basic hardening, rate-limit auth and test submit |
| Dev tooling | concurrently, nodemon, ESLint, Prettier | Run both apps with one command |

---

## 3. Folder structure

```
typing_Speed/
├── client/                    # Next.js app (port 3000)
│   ├── app/                   # routes, see docs/PAGES.md
│   ├── components/
│   │   ├── typing/            # TypingArea, Caret, Word, StatsBar, Timer, Keyboard
│   │   ├── results/           # ResultCard, WpmChart, KeyHeatmap
│   │   └── ui/                # Button, Card, Modal, Tabs, Navbar
│   ├── hooks/                 # useTypingEngine, useTimer, useAuth
│   ├── lib/                   # api.ts, scoring.ts, textGen.ts, storage.ts
│   └── types/
├── server/                    # Express API (port 5000)
│   ├── src/
│   │   ├── routes/            # auth, levels, practice, tests, users, leaderboard
│   │   ├── controllers/
│   │   ├── models/            # User, TestAttempt, PracticeSession
│   │   ├── middleware/        # auth, validate, rateLimit, errorHandler
│   │   ├── services/          # scoring.js (server-side replay), textGen.js
│   │   └── index.js
│   └── data/                  # word banks + passages per level (JSON)
├── shared/                    # scoring rules + level config used by both sides
├── docs/                      # detailed plan files
├── package.json               # root scripts (npm run dev → both apps)
├── start.bat
├── PLAN.md
└── README.md
```

`shared/` holds the level list and the scoring function so the client's live numbers and the server's final numbers always use the same formula.

---

## 4. Feature summary

### 4.1 For everyone (no login)
- Landing page with a 30-second try-it box
- Practice mode on all 7 levels
- Results screen after each practice run
- Practice history kept in the browser (localStorage)
- Public leaderboard

### 4.2 For logged-in users
- Test mode (1 / 3 / 5 min) with saved scores
- Level unlocking based on test results
- Dashboard: best WPM per level, progress chart, history, weak-key heatmap
- Weak-keys drill built from their own mistakes
- Shareable result page for each test

Details: [`docs/MODES.md`](docs/MODES.md), [`docs/LEVELS.md`](docs/LEVELS.md).

---

## 5. Build phases

### Phase 1: Setup
- [ ] Root `package.json` with `npm run dev` (concurrently runs client + server)
- [ ] `client/`: create-next-app with TypeScript, Tailwind, App Router
- [ ] `server/`: Express app, helmet, cors, cookie-parser, error handler, `/api/health`
- [ ] MongoDB Atlas connection via `MONGODB_URI`
- [ ] `.env.example` for both apps, `start.bat`

### Phase 2: Typing engine
- [ ] `shared/levels.js` and `shared/scoring.js`
- [ ] Word banks and passages for all 7 levels in `server/data/`
- [ ] `useTypingEngine` hook: per-character state, caret, keystroke log, timer
- [ ] `TypingArea` component with correct/incorrect highlighting and smooth caret
- [ ] Live `StatsBar` (WPM, accuracy, time)

### Phase 3: Practice mode
- [ ] `/practice` level picker and `/practice/[level]` screen
- [ ] Options: time (15/30/60/120s), words (10/25/50/100), full passage
- [ ] Results screen with WPM chart and missed keys
- [ ] Guest history in localStorage

### Phase 4: Auth
- [ ] User model, register/login/logout/me endpoints
- [ ] JWT cookie, `requireAuth` middleware
- [ ] Login/register pages, `useAuth` hook, protected routes
- [ ] Logged-in practice sessions saved to the database

### Phase 5: Test mode
- [ ] `POST /api/tests/start` issues text + testId
- [ ] Client sends the keystroke log on finish
- [ ] Server replays the log, scores it and runs anti-cheat checks
- [ ] Level unlock logic
- [ ] `/results/[id]` page

### Phase 6: Dashboard
- [ ] Stats, history (paginated) and weak-keys endpoints
- [ ] Dashboard page: best per level, progress chart, heatmap
- [ ] Weak-keys drill in practice mode

### Phase 7: Leaderboard and polish
- [ ] Leaderboard endpoint + page (filter by level and duration)
- [ ] Shareable result card (Open Graph image)
- [ ] Dark/light theme, sound toggle, font size setting
- [ ] Mobile notice ("works best with a physical keyboard")
- [ ] Accessibility pass (focus states, reduced motion, contrast)

### Phase 8: Deploy
- [ ] Client on Vercel
- [ ] API on Render or Railway (or Vercel serverless functions, as in Kalorie)
- [ ] Atlas network access + production env vars
- [ ] README with live links and screenshots

---

## 6. Environment variables

**server/.env**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**client/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 7. Testing

| What | How |
|---|---|
| Scoring formulas | Unit tests (Vitest) on `shared/scoring.js` with fixed keystroke logs |
| Server replay | Same keystroke logs through the server must give the same numbers as the client |
| API | Supertest against an in-memory MongoDB (mongodb-memory-server) |
| Typing UI | Manual checks: backspace, skipping words with space, finishing early, tab switching |

---

## 8. Open questions

1. Should Test mode allow backspace, or offer a strict "no corrections" option? (Current plan: backspace allowed, corrected errors still lower accuracy.)
2. Should guests be able to take tests without saving, or is Test login-only? (Current plan: login-only.)
3. Leaderboard: all-time only, or also weekly? (Current plan: all-time + weekly tabs.)
