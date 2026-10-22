<div align="center">

# 🍴 KALORIE

### Day-wise, meal-wise calorie & macro tracker — type what you ate, in plain English.

*“2 roti + mango shake + tea”* → logged, with calories, carbs & protein estimated automatically.

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## ✨ Features

| | |
|---|---|
| 📅 **Day-wise tracking** | Pick any date and see exactly what you ate that day. |
| 🍳 **Meal-wise logging** | Breakfast, lunch, dinner & snacks — each item with **calories, carbs, protein & serving size**. |
| ⌨️ **Natural-language quick-add** | Type a whole meal in one line; Gemini parses items, quantities & nutrition. |
| 🌍 **Country-aware estimates** | Portions & dishes biased to your country (roti, sabzi, lassi…). |
| 🎯 **Personalised targets** | Daily calorie + macro goals from gender, age, height, weight, activity & veg/non-veg diet (Mifflin–St Jeor BMR × activity factor). |
| 🔵 **Circular progress ring** | Live percentage in the centre, colour shifting red → green as you near your goal. |
| 🌗 **Dark / light mode** | Deep-blue-with-red dark theme by default; toggle persists. |
| 🔐 **Accounts & JWT auth** | Each user has their own profile and private log, stored in MongoDB. |

---

## 🧱 Tech stack

**Frontend** · React 18 · Redux Toolkit · React Router · Vite
**Backend** · Node.js · Express · Mongoose · JWT · bcrypt
**Data & AI** · MongoDB Atlas · Google Gemini (`gemini-2.5-flash`) · Open Food Facts
**Hosting** · Vercel (static client + serverless API, single project)

---

## ⚠️ API key not included

This repo does **not** ship a Gemini API key (or any other secret). The real `.env` files are gitignored, so after cloning **you have to add your own key** — without it, the one-line meal parsing (`/api/foods/parse`) fails with `GEMINI_API_KEY is not configured`. Get a free key at [Google AI Studio](https://aistudio.google.com/apikey) and put it in `.env` (see [Environment variables](#-environment-variables)). You also need your own `MONGO_URI` and `JWT_SECRET`.

---

## 🚀 Quick start (local)

> **Prerequisites:** Node.js 18+ and a MongoDB you can reach (local `mongodb://127.0.0.1:27017` or an Atlas URI).

**1. Create the env files** (one time):

```bash
cp .env.example .env                 # add your GEMINI_API_KEY
cp server/.env.example server/.env   # add MONGO_URI and JWT_SECRET
```

**2. Start the app**

**Windows:** double-click **`start.bat`** (or run it from a terminal). The first time, it installs the `server` and `client` dependencies. Then it opens two windows, one for the API (port 5000) and one for the client (port 5173).

**Any OS, by hand:**

```bash
# Backend
cd server
npm install
npm run dev                 # → http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev                 # → http://localhost:5173
```

**3. Open http://localhost:5173.** The Vite dev server forwards `/api` to the backend on port 5000.

---

## 🔑 Environment variables

Secrets are kept out of git (see [`.gitignore`](./.gitignore)). Copy the templates and fill in real values:

```bash
cp .env.example .env                 # GEMINI_API_KEY
cp server/.env.example server/.env   # MONGO_URI, JWT_SECRET, ...
```

| Variable | Where | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | root `.env` | Background nutrition lookup (Gemini) — [get a key](https://aistudio.google.com/apikey) |
| `MONGO_URI` | `server/.env` | MongoDB connection. **Must end with `/calorie-tracker`** before the `?` |
| `JWT_SECRET` | `server/.env` | Signs auth tokens — any long random string |
| `CLIENT_ORIGIN` | `server/.env` | Allowed CORS origin in local dev |

> 💡 **Gotcha:** an Atlas URI like `…mongodb.net/?retryWrites=true` (no DB name) silently writes to a database called `test`. Always include the name: `…mongodb.net/calorie-tracker?retryWrites=true`.

---

## ☁️ Deploy to Vercel

The whole app ships as a **single Vercel project**: the Vite build is served as static files, and the Express API runs as a serverless function under `/api/*`. The client calls the API with same-origin `/api` paths, so there's **no CORS or extra URL config**.

```
                 ┌─────────────────────────────┐
  Browser  ───▶  │  Vercel (one project)       │
                 │                             │
   /            ─┤─▶ client/dist  (static SPA) │
   /api/*       ─┤─▶ api/index.js (serverless) ─┼──▶  MongoDB Atlas
                 │      └ Express app + Gemini  │
                 └─────────────────────────────┘
```

**How it's wired**
- `api/index.js` — serverless handler; reuses the same Express app + a cached Mongo connection (`server/src/app.js`, `server/src/db.js`).
- `vercel.json` — builds the client, serves `client/dist`, rewrites `/api/*` → the function and everything else → `index.html` (SPA routing).
- root `package.json` — holds the server dependencies so the function can resolve them.

**Steps**
1. Push to GitHub and **import the repo into Vercel** (root directory = repo root).
2. Use a **MongoDB Atlas** URI (a local DB isn't reachable from Vercel). In Atlas → **Network Access**, allow `0.0.0.0/0`.
3. **Settings → Environment Variables** → add `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`.
   *(Env vars only apply to deployments made **after** they're added — redeploy if needed.)*
4. Deploy. Vercel runs `npm run vercel-build` and bundles `api/index.js` automatically.
5. **Verify:** open `/api/health` → `{"status":"ok"}`, then register an account.

---

## 📡 API reference

All routes are prefixed with `/api`. Routes marked 🔒 require a `Bearer <jwt>` header.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check |
| `POST` | `/auth/register` | Create account + compute calorie/macro targets |
| `POST` | `/auth/login` | Log in, returns JWT |
| `GET` | 🔒 `/auth/me` | Current user profile |
| `PATCH` | 🔒 `/auth/me` | Update profile + recompute targets |
| `GET` | 🔒 `/entries?date=YYYY-MM-DD` | A day's entries grouped by meal + totals |
| `POST` | 🔒 `/entries` | Add one food item |
| `POST` | 🔒 `/entries/bulk` | Add several items at once |
| `DELETE` | 🔒 `/entries/:id` | Remove a food item |
| `GET` | 🔒 `/foods/search?q=` | Search foods (local staples + Open Food Facts) |
| `POST` | 🔒 `/foods/parse` | Parse a free-text meal line into nutrition (Gemini) |
| `POST` | 🔒 `/contact` | Submit the About-Us contact form |

---

## 🗂️ Project structure

```
kalorie/
├─ api/
│  └─ index.js              # Vercel serverless handler (wraps the Express app)
├─ vercel.json              # Single-project build + routing config
├─ package.json             # Server deps (so the serverless fn can resolve them)
├─ server/
│  └─ src/
│     ├─ app.js             # Express app (middleware + routes) — shared
│     ├─ db.js              # Cached Mongo connection (serverless-safe)
│     ├─ index.js           # Local dev entry: load env → connect → listen
│     ├─ models/            # User, FoodEntry, Contact
│     ├─ routes/            # auth, entries, foods, contact
│     ├─ middleware/auth.js # JWT verification
│     └─ utils/             # calories (Mifflin–St Jeor), gemini
└─ client/
   └─ src/
      ├─ store/             # Redux Toolkit slices (auth, entries, theme)
      ├─ api/client.js      # fetch wrapper with JWT
      ├─ pages/             # Landing, Login, Register, Dashboard, Settings, About
      ├─ components/        # MealCard, DaySummary, CircularProgress, QuickAdd, …
      └─ styles/theme.css   # Dark/light theme tokens
```

---

## 🧮 How targets are calculated

Daily calorie goals use the **Mifflin–St Jeor** equation for BMR, scaled by an activity factor:

```
BMR (male)   = 10·kg + 6.25·cm − 5·age + 5
BMR (female) = 10·kg + 6.25·cm − 5·age − 161
Target kcal  = BMR × activity factor
```

Macros are then split into protein and carb targets based on the chosen diet type. *(Age and activity level extend the original gender/height/weight spec — the formula needs them to produce a realistic number.)*

---

<div align="center">

Made with 🍴 and a healthy respect for roti portion sizes.

</div>
