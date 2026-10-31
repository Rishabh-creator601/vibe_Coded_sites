# Vibe coded sites

| Website | Type | Keys needed | Live | Remarks |
| --- | --- | --- | --- | --- |
| [Kalorie](Kalorie/README.md) | Calorie tracking app | Yes: Gemini API key, MongoDB URI, JWT secret | - | - |
| [Saffron & Steam](saffron_and_steam/README.md) | Restaurant and café site | No (runs on sample data) | - | Under construction: the API, payments and emails are not built yet |
| [Keystone](typing_Speed/README.md) | Typing speed test and practice | Yes: MongoDB URI, JWT secret | [keystone-typing-speed.vercel.app](https://keystone-typing-speed.vercel.app) | Deployed; see its [deploy log](typing_Speed/docs/DEPLOY_LOG.md) for open items |

## How to start

Each site lives in its own folder and has its own `start.bat` (Windows). The first run installs the dependencies.

| Site | Folder | Start | Opens at |
| --- | --- | --- | --- |
| Kalorie | [`Kalorie/`](Kalorie/README.md) | `Kalorie\start.bat` | http://localhost:5173 |
| Saffron & Steam | [`saffron_and_steam/`](saffron_and_steam/README.md) | `saffron_and_steam\start.bat` | http://localhost:3000 |


