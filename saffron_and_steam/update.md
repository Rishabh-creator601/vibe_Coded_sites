# Updates

## 22 Oct 2026: demo-ready build, Express API added

### Show the site

Double-click **`start.bat`**, then open **http://localhost:3000**. It runs on sample data only: no API keys, database or `.env` file needed. Orders and bookings are saved in the visitor's browser.

### What's switched off for the demo

| Part | State | How to turn it back on |
|---|---|---|
| Chatbot (chat window + WhatsApp button) | Off. It no longer appears on any page; all its files are kept (`components/chat/`, `lib/chat/`, `app/api/chat/`). | In `apps/web/app/[locale]/layout.tsx`, import `ChatWidget` from `@/components/chat/chat-widget` and render `<ChatWidget />` where the comment says. |
| Express API + MongoDB | Built, but the web app doesn't use it. | See "Use the API" below. |
| Admin dashboard | Not built (left out on purpose). | n/a |
| Real payments (Razorpay) | Not built (left out on purpose). Online payment is a clearly labelled demo screen that takes no money. | n/a |

### Fixes so nothing breaks during a demo

- **Newsletter form** (footer): it always showed "Couldn't subscribe" because no API was running. It now shows the subscribed message.
- **Missing text**: added the new messages (order and booking errors, cancelled orders, "not found" pages) in all 5 languages. They're AI-drafted, like the rest of the translations.

### New: Express API (`apps/api`)

Express 5 + TypeScript + Mongoose + Zod. It follows PLAN.md sections 5–9.

| Endpoint (`/api/v1`) | What it does |
|---|---|
| `GET /health` | API and database status |
| `GET /menu`, `/menu/featured`, `/menu/items/:slug` | Menu with diet / category filters and search in the visitor's language |
| `GET /settings/public` | Hours, address, delivery zones and whether the café is open now |
| `POST /delivery/quote` | Delivery zone, fee and minimum order for a pincode |
| `POST /orders`, `GET /orders/:ref?token=` | Places an order (prices worked out again on the server) and opens it from the tracking link |
| `GET /reservations/availability`, `POST /reservations`, `GET /reservations/:ref?token=` | Free tables, booking with optional pre-order, opening a booking |
| `POST /orders/:ref/demo-payment`, `POST /reservations/:ref/demo-payment` | Demo payment only (`DEMO_MODE=true`) |
| `POST /contact`, `POST /newsletter` | Contact messages and newsletter sign-ups, saved in MongoDB |

How it protects the data:

- **Prices are set by the server.** The browser sends only dishes, quantities and options; a request carrying a price is rejected.
- **Unknown or sold-out dishes are refused.** So are delivery outside the zones, orders below a zone's minimum, and cash on delivery above the limit.
- **Order and booking links need a random token.** Only its hash is stored, so references can't be guessed.
- **A slot can't be overbooked.** The seat check and update are one database operation, so two people can't both take the last seats.
- **Unpaid online orders are cancelled after 15 minutes.** In demo mode, order status moves on by itself so tracking can be shown.
- **Request checks:** Zod validation on every input; a block on MongoDB operators hidden in requests; helmet, CORS limited to the web app's address, and rate limits on forms, orders and bookings.
- **The menu loads itself.** On first start, the 61-dish menu and café settings are loaded into an empty database (`AUTO_SEED`).

Shared code moved to `packages/shared` so the web app and the API use the same rules: order and booking types, the order status flow, and phone and email checks.

### Use the API (optional)

1. MongoDB must be running (locally at `mongodb://127.0.0.1:27017`, or an Atlas URL).
2. Copy `apps/api/.env.example` to `apps/api/.env`.
3. `npm run dev:api` (API on http://localhost:4000).
4. In `apps/web/.env.local`, add `NEXT_PUBLIC_USE_API=true`, then restart the web app.

Other commands: `npm run seed -w api` reloads the sample menu, and `npm run test -w api` runs the API tests (they use a separate `saffron_and_steam_test` database).

### Checks run

- API tests: **26 passed** against the local MongoDB. They cover:
  - server pricing and a tampered price;
  - sold-out dishes, delivery zones, minimum order and the cash-on-delivery limit;
  - tracking tokens, demo payment and the 15-minute auto-cancel;
  - five parties booking the same slot at the same moment, of which only three fit.
- Type check (web, api, shared), lint, the missing-translation check (all 5 languages have the same 393 keys) and the production build all pass.
- All 11 pages load in all 5 languages (55 pages).
- Clicked through in Chrome, with no console errors and no chat button on any page:
  - placed an order through the demo payment to the tracking page;
  - booked a table with a pre-order to the confirmation page.

### Still to do (from PLAN.md)

- Admin dashboard, Razorpay test mode and emails: left out for now.
- Chatbot: switch it back on when it's ready (see the table above).
- Read the menu from the API on the menu pages. They still use the sample data in `packages/shared`, which is the same data the API loads.
- Deploy: Vercel for the web app; Render and MongoDB Atlas for the API.
