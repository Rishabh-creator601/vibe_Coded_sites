# Odd Hour: one page, ten themes

One first page for a fictional Bengaluru coffee roaster, designed ten different ways. Every theme
has its own layout, type, photo treatment and animation, plus its own light and dark mode.

Built with Next.js, Framer Motion, Express, Node.js and MongoDB. See [PLAN.md](PLAN.md) for the
design plan and tokens.

## Run it

You need Node 20.12 or newer and MongoDB running locally.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The content is added to MongoDB automatically on the first run.

To use a different database, copy `server/.env.example` to `server/.env` and edit it.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the website (port 3000) and the API (port 4000) |
| `npm run build` | Builds the website for production |
| `npm start` | Runs the production build and the API |
| `npm run seed` | Overwrites the page content in MongoDB with `server/data/content.json` |
| `npm run previews` | Retakes the gallery's screenshots. Needs the site running and Chrome installed |
| `npm test` | Runs the API tests |

## Using the site

The first page, `/`, lists all ten themes. It has three ways to find one:

- **Header:** jumps to a category, and highlights the category on screen.
- **Large carousel:** steps through all ten with the arrows, the left and right arrow keys, or the
  strip of thumbnails.
- **Category carousels:** swipe or use the arrows to browse Paper and print, Bold and retro, Maps
  and signs, and Calm and natural.

Inside a theme, the bar in the bottom-right corner has everything for moving around:

| Control | What it does |
| --- | --- |
| Grid icon | Back to the list of themes |
| Arrows | Previous or next theme, looping from 10 back to 1 |
| Theme name | Opens a list of all ten, to jump straight to one |
| Light / Dark | Switches mode, which is remembered across themes and visits |

Each theme also has its own address, so you can link to one directly.

| # | Theme | Address |
| --- | --- | --- |
| 1 | Night Chart | `/night-chart` |
| 2 | Meter Kaapi | `/meter-kaapi` |
| 3 | Riso Zine | `/riso-zine` |
| 4 | Departures | `/departures` |
| 5 | Cupping Notes | `/cupping-notes` |
| 6 | Marine Drive | `/marine-drive` |
| 7 | Supergraphic | `/supergraphic` |
| 8 | Receipt | `/receipt` |
| 9 | Herbarium | `/herbarium` |
| 10 | Kissa | `/kissa` |

## Changing the content

All copy, coffees and photo references are in `server/data/content.json`. Edit it, then run
`npm run seed`. The brand is fictional, so replace it before using this for a real business.

The list shows saved screenshots, not live pages, so it does not change when a theme does. Run
`npm run previews` after changing a theme or its content.

## How it fits together

- **Website:** `client/`. Each theme has its own route in `client/app/<slug>/` and its own folder
  in `client/themes/<slug>/`, so a page loads only that theme's CSS, JavaScript and fonts.
- **API:** `server/`. Next.js forwards `/api/*` to Express.
- **Database:** `reservations` holds form submissions, one per email, coffee and roast.
  `contents` holds the page content.

| Route | What it does |
| --- | --- |
| `GET /api/content` | Page content, the next roast date and the bags left |
| `POST /api/reservations` | Saves a reservation with `name`, `email`, `coffee` and `grind` |
| `GET /api/health` | Reports whether the database is connected |

If MongoDB is unreachable, the page still loads from `content.json`, the bag count is hidden, and
the form says reservations are offline. The API reconnects by itself. If the API itself is down,
the website shows a page explaining that.

## Adding a theme

1. Add it to `THEMES` in `client/lib/themes.ts`.
2. Copy any `client/app/<slug>/page.tsx` to a new folder and change the slug.
3. Create `client/themes/<slug>/` with `index.tsx`, `styles.module.css` and `fonts.ts`.
4. For the list page, add its slug to a category in `CATEGORIES` in `client/lib/themes.ts`, its
   typeface to `client/components/gallery/fonts.ts` and its slug to
   `scripts/capture-previews.mjs`, then run `npm run previews`.

A theme's root element sets its colours as CSS variables, with dark values under
`:global(html[data-mode='dark']) .root`. It also sets `--dock-bg`, `--dock-fg`, `--dock-accent` and
`--dock-on-accent` for the switcher, and renders `<ThemeDock slug="..." />` as its last child.

`<ReservationForm>` takes the theme's CSS module and uses these classes: `form`, `field`, `label`,
`input`, `select`, `submit`, `fieldError`, `formError`, `success`, `successTitle`, `successBody`.

## Known limit

The bag count is checked just before each reservation is saved, so two people booking the very
last bag at the same moment could both succeed. That is fine for a demo, but a real shop should
reserve bags with an atomic counter.

## Photos

Photos are from [Unsplash](https://unsplash.com/license) and stored in `client/public/images/`.
`client/public/images/dither/` holds 1-bit versions made from them for the Receipt theme.
