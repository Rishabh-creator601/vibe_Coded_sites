# Vibe coded sites 



| Website Name     | Type | Api key needed  | Remakrs | 
| -------- | ------- | ------ | -----
| Kalorie  | calorie tracking app    | yes |  - |
| Safron and Steam | A restuarant and cafe needed     | Yes  | Under construction |

## How to start

Each site lives in its own folder and has its own `start.bat` (Windows). The first run installs the dependencies.

| Site | Folder | Start | Opens at |
| --- | --- | --- | --- |
| Kalorie | [`Kalorie/`](Kalorie/README.md) | `Kalorie\start.bat` | http://localhost:5173 |
| Saffron & Steam | [`saffron_and_steam/`](saffron_and_steam/README.md) | `saffron_and_steam\start.bat` | http://localhost:3000 |

> **Kalorie needs your own keys.** This repo does not include the Gemini API key, MongoDB URI or JWT secret. Create `Kalorie/.env` and `Kalorie/server/.env` from the `.env.example` files before you start it. See the [Kalorie README](Kalorie/README.md).

For non-Windows steps, see each site's README.
