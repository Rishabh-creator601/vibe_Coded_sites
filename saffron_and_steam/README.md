# Saffron & Steam

A demo website for a **fictional** café: breakfast, lunch and dinner, plus tea and coffee all day, in 5 languages (English, हिन्दी, বাংলা, मराठी, తెలుగు). The full build plan is in [`PLAN.md`](PLAN.md).

## Status (22 Oct 2026)

| Part | State |
|---|---|
| Monorepo (npm workspaces): `apps/web`, `packages/shared` | Done |
| 5 languages (`/en`, `/hi`, `/bn`, `/mr`, `/te`), language switcher, missing-key check | Done |
| **Home**: live open/closed status, meal-time ribbon, favourites, pickup / dine-in / delivery with pincode checker | Done |
| **Menu**: 61 dishes (Indian, Italian, American, Japanese, French) in Breakfast / Lunch / Dinner / Tea & coffee / Desserts; cuisine and diet filters, search, allergens, "available now" | Done |
| **Gallery**: 69 photos by category (each meal, drinks, desserts, café & kitchen), full-screen viewer with arrow keys | Done |
| **Contact**: form checked on the server (Next.js server action) and logged; returns a reference number | Done (demo: not emailed yet) |
| **Book a table**: date, meal, time slot, party size, food type and diet, optional pre-order → review page → pay online or at the café → confirmation | Done (demo: saved in the browser) |
| **Cart and checkout**: pickup / dine-in / delivery (pincode zones, minimum order, free delivery above ₹500), 5% tax, pay online, at the counter or cash on delivery → order tracking page | Done (demo: saved in the browser) |
| About, photo credits | Done |
| Express API (`apps/api`) + MongoDB, Razorpay test mode, emails | Not started. The online payment is a clearly labelled **demo screen**: it asks for no card details and takes no money. |

## Run it

Needs Node.js 20 or later.

```bash
npm install
npm run dev:web          # http://localhost:3000 (redirects to /en or your browser's language)
```

Other commands:

```bash
npm run build                          # production build of the web app
npm run lint
npm run typecheck
npm run check:messages -w web          # fails if a translation key is missing in any language
```

## How it's organised

- `packages/shared`: types that mirror the MongoDB collections, the 61-dish sample menu (`menu-data.ts`), café settings, photo credits, and the logic both apps share (what's being served now, delivery-zone lookup, ₹ and time formatting).
- `apps/web`: Next.js 16 (App Router, Cache Components). Every page is pre-rendered for all 5 languages; the "Open now" status and the "now" marker are worked out in the browser in the café's time zone (`Asia/Kolkata`), so a cached page never shows stale hours.
  - `app/[locale]/`: pages; `proxy.ts` picks the language.
  - `messages/*.json`: interface text per language.
  - `components/home/`: the home page sections.

## Design notes

- Colours: chai cream, roast-brown text, kulhad (clay-cup) terracotta for actions, saffron for "now". The meal ribbon runs from morning light (breakfast) to evening clay (dinner).
- Type: **Tiro** for headings and **Hind** for body text. Both families have Latin, Devanagari, Bengali and Telugu cuts, so all 5 languages share one look. Only the current language's fonts load.
- Indian food marks: green dot for vegetarian, red triangle for non-vegetarian, amber for egg.

## Honesty notes

- Saffron & Steam is made up. The address, phone number, prices, pincodes and offers are samples.
- Translations are **AI-drafted and not reviewed by native speakers**.
- Photos are free-licence images from Pexels and Wikimedia Commons (CC0, CC BY, CC BY-SA), not from Google Images. Every photographer, licence and source link is listed on the site's `/credits` page and in `packages/shared/src/photo-credits.ts`. CC BY and CC BY-SA photos must keep that credit.
- Dish names and descriptions are written for the demo; prices are made up.
- Orders and bookings are stored in the visitor's browser (localStorage) until the API exists. The order-tracking status moves on by itself so the flow can be shown in a demo video.
