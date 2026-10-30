# Pages, Components and Design

Back to [PLAN.md](../PLAN.md)

---

## 1. Routes (Next.js App Router)

| Route | Access | Rendering | What's on it |
|---|---|---|---|
| `/` | Public | Static | Hero, 30s try-it box, how it works (Practice vs Test), level preview, CTA |
| `/practice` | Public | Static | 7 level cards with sample text and your best WPM |
| `/practice/[level]` | Public | Client | Option bar, typing area, live stats, results panel |
| `/practice/weak-keys` | Login | Client | Weak-keys drill |
| `/test` | Public (start needs login) | Client | Level cards with lock status, duration picker |
| `/test/[level]` | Login | Client | Rules notice → typing area → submitting → redirect |
| `/results/[id]` | Public | Server | Test result, chart, share buttons, Open Graph image |
| `/dashboard` | Login | Client | Stats, best per level, progress chart, heatmap, history |
| `/leaderboard` | Public | Server (revalidate 60s) | Tabs for level, duration and period, ranking table |
| `/login`, `/register` | Guests | Client | Forms |
| `/settings` | Login | Client | Name, theme, sound, font size, delete account |
| `/about` | Public | Static | How WPM and accuracy are calculated (from SCORING.md, in plain words) |

`middleware.ts` redirects to `/login?next=...` for login-only routes when there's no `token` cookie. The API still checks auth itself.

---

## 2. Main components

### Typing
| Component | Job |
|---|---|
| `TypingArea` | Renders words and chars from engine state, holds the hidden input, scrolls 3 visible lines |
| `Word` / `Char` | Colour by state: pending (muted), correct (bright), incorrect (red), extra (dark red) |
| `Caret` | Absolutely positioned, animates between chars, blinks when idle |
| `StatsBar` | Timer/countdown, live WPM, accuracy (practice only) |
| `OptionBar` | time / words / passage / untimed + values; stage (Beginner); language (Code) |
| `OnScreenKeyboard` | Highlights the next key; practice only; toggle in settings |
| `FocusOverlay` | "Click or press any key to focus" when the input loses focus |

### Results
| Component | Job |
|---|---|
| `ResultCard` | Net WPM headline, accuracy, raw WPM, chars breakdown |
| `WpmChart` | Recharts line chart: net + raw per second, error dots |
| `KeyHeatmap` | Keyboard with keys coloured by error rate |
| `LevelStatus` | Passed / not passed, newly unlocked levels |

### Layout
`Navbar` (logo, Practice, Test, Leaderboard, Dashboard / Login), `Footer`, `LevelCard`, `Button`, `Card`, `Tabs`, `Modal`, `Toast`.

---

## 3. Screen states

**Typing screen:** `idle` (caret blinking, "Start typing") → `running` (stats live, navbar fades) → `finished` (results panel) → `submitting` (test only: spinner "Calculating your score…") → `error` (retry button; the keystroke log is kept in memory, so retrying doesn't lose the attempt).

**Empty states:**
- Dashboard with no tests: "No tests yet. Take your first test to see your stats here." + button
- Leaderboard with no entries: "No scores yet for this level. Be the first!"
- Weak keys with little data: "Type a bit more so we can find your weak keys."

---

## 4. Keyboard shortcuts

| Shortcut | Action |
|---|---|
| Tab → Enter | Restart (same text in practice; abandons a test) |
| Enter (on results) | Next run with new text |
| Esc | Open the options menu / finish an untimed run |
| Ctrl + Backspace | Delete the current word |

Shown in a small footer hint on the typing screens.

---

## 5. Design

- **Look:** minimal and focused; the text is the main thing on screen. Dark theme by default, with a light theme option.
- **Fonts:** a monospace font for the typing text (JetBrains Mono or Roboto Mono via `next/font`), a clean sans-serif for UI.
- **Colours (dark):** background `#0f1115`, muted text `#5c6370`, typed correct `#e6e6e6`, error `#ef4444`, accent/caret `#f5c542`.
- **Typing text size:** 24px default (sm 20px, lg 30px), max width ~900px, 3 lines visible.
- **While typing:** navbar and footer fade to low opacity so nothing distracts.
- **Motion:** smooth caret movement; respects `prefers-reduced-motion` (caret jumps instead of sliding).
- **Sound (optional, off by default):** soft click per key, a different sound for errors.

---

## 6. Responsive and accessibility

- Works down to 360px wide, but typing needs a physical keyboard. On touch devices, show: "For accurate results, use a device with a physical keyboard." Practice still works with on-screen keyboards; Test shows the warning before starting.
- All controls reachable by keyboard, visible focus rings.
- Colour isn't the only signal for errors: incorrect chars also get an underline.
- Contrast meets WCAG AA in both themes.
- Results are announced to screen readers via an `aria-live` region.
