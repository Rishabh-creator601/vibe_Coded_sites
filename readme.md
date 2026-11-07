# Vibe coded sites

| Website | Type | API key | Live | Remarks |
| --- | --- | --- | --- | --- |
| [Kalorie](Kalorie/README.md) | Calorie tracking app | Yes (Gemini) | - | - |
| [Saffron & Steam](saffron_and_steam/README.md) | Restaurant and café site | Optional (OpenAI, for the chatbot) | - | Under construction: online payments (Razorpay) and emails are not built yet |
| [Keystone](typing_Speed/README.md) | Typing speed test and practice | No | [keystone-typing-speed.vercel.app](https://keystone-typing-speed.vercel.app) | Deployed; see its [deploy log](typing_Speed/docs/DEPLOY_LOG.md) for open items |

## How to start

Each site lives in its own folder and has its own `start.bat` (Windows). The first run installs the dependencies.

| Site | Folder | Start | Opens at |
| --- | --- | --- | --- |
| Kalorie | [`Kalorie/`](Kalorie/README.md) | `Kalorie\start.bat` | http://localhost:5173 |
| Saffron & Steam | [`saffron_and_steam/`](saffron_and_steam/README.md) | `saffron_and_steam\start.bat` | http://localhost:3000 |

## API keys and external services

This repo does not include any keys or secrets. Create your own `.env` files from the `.env.example` files in each site.

| Site | API key | Required to run | Other services (no key needed) |
| --- | --- | --- | --- |
| Kalorie | **Yes:** Gemini (`GEMINI_API_KEY`) | MongoDB (local or Atlas), plus a `JWT_SECRET` you make up yourself | Open Food Facts (food search), Unsplash (landing page images) |
| Saffron & Steam | **Optional:** OpenAI (`OPENAI_API_KEY`) | Nothing external: runs on sample data | Google Fonts; MongoDB only if you run the optional API in `apps/api` |
| Keystone | **No** | MongoDB (local or Atlas) | Google Fonts |

- **Kalorie:** without the Gemini key the site still starts, but turning a typed meal into calories and macros returns an error. Without `JWT_SECRET`, sign-up and login fail.
- **Saffron & Steam:** without the OpenAI key the chatbot falls back to word matching.
- **Keystone:** `JWT_SECRET` has a development default for local use. Set a real one in production.
- **MongoDB:** Kalorie and Keystone use a local database if no connection string is set, and their servers stop if they can't connect.

For non-Windows steps, see each site's README.
