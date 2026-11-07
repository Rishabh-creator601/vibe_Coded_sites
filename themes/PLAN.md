# Odd Hour: one page, ten themes

## The brief

One website, one first page, 10 themes. Every theme has its own light and dark mode, shows
images and a form, and has a little animation. Stack: Next.js, Express, Node.js, MongoDB,
Framer Motion.

## The subject (a proposal, easy to change)

No subject was given, so the site is for **Odd Hour**, a fictional small-batch coffee roaster in
Bengaluru. They roast twelve kilos every Tuesday at 4 a.m. because the neighbours only complain
about the smoke during the day. Coffee works here because its world (sign painting, cupping
notebooks, sacks, receipts, botanical plates) gives every theme a real reason to look the way
it does.

The primary job of the page is to reserve a bag from the next roast. All copy and images live in
`server/data/content.json`, so another brand means editing one file.

## Architecture

```
Browser ──> Next.js (client/, port 3000) ──/api rewrite──> Express (server/, port 4000) ──> MongoDB
```

| Piece | What it does |
| --- | --- |
| `client/app/<slug>/page.tsx` | One route per theme, so each loads only its own CSS, JS and fonts |
| `client/app/page.tsx` | `/` is the list page: a cyan header and featured carousel, then a carousel per category |
| `client/themes/<slug>/` | The theme: `index.tsx` for its own markup, `styles.module.css` for its own design |
| `client/components/ThemeDock` | Floating switcher: previous, next, list of all 10, light/dark |
| `client/components/HomeBar` | Cyan Back to home button, pinned top left on every theme |
| `client/components/ReservationForm` | One form with one behaviour, styled by each theme's CSS |
| `GET /api/content` | Page content plus the live batch: next roast date and bags left |
| `POST /api/reservations` | Validates the form and saves it to MongoDB |

**Light and dark.** Each theme defines its own two palettes as CSS variables, switched by
`data-mode` on `<html>`. The choice is kept in a cookie so the server renders the right mode with
no flash. First visits follow the system setting.

**If MongoDB is down.** The page still renders from `content.json`. The bag count is hidden and
the form says plainly that reservations are offline.

## The list page

A cyanotype, the old sun-printing process, gives the page its cyan. In the large carousel a new
slide appears washed in cyan and develops into full colour. That is the page's one memorable moment,
and it only runs when the page opens or the visitor changes slide.

| Token | Light | Dark |
| --- | --- | --- |
| Page | Ice `#E4F9FC` | Abyss `#04262E` |
| Panel | Cyan `#11C5DC` | `#07505E` |
| Text | Deep `#03323B` | `#DFFBFF` |
| Secondary text | Lagoon `#08606D` | `#9EDDE7` |
| Buttons | Deep `#03323B` | Signal `#35E3F7` |

Type is Anybody for headlines and Figtree for reading. Categories are Paper and print, Bold and
retro, Maps and signs, and Calm and natural.

## Rules for all ten

- **One memorable moment each.** One orchestrated animation per theme, not fade-ups on every
  section. Other motion answers something the visitor did.
- **Different layouts, not recolours.** Each theme has its own markup. The test is that you could
  not tell two themes share a codebase from a screenshot.
- **Each theme handles photos its own way**, so the same pictures feel native in each.
- **Quality floor:** responsive to mobile, visible keyboard focus, `prefers-reduced-motion`
  respected, real labels on the form, readable contrast in both modes.

## The ten themes

| # | Theme | Idea | Memorable moment |
| --- | --- | --- | --- |
| 1 | Night Chart | A star atlas of the hours before dawn | A 24-hour dial sweeps round to 4 a.m., then a constellation draws itself |
| 2 | Meter Kaapi | A hand-painted Bengaluru darshini signboard | Coffee is poured tumbler to davara, the "metre" pour |
| 3 | Riso Zine | A two-ink, misprinted risograph zine | Pink and blue inks slide into register, then follow the pointer |
| 4 | Departures | A station board where coffees depart | Split-flap letters clatter into the headline |
| 5 | Cupping Notes | The roaster's working notebook | Pen annotations draw themselves; the flavour chart morphs per coffee |
| 6 | Marine Drive | Bombay art deco cinema | A brass sunburst fans open behind the arch |
| 7 | Supergraphic | 1970s stripes on a hi-fi sleeve | Five stripes draw across the page as you scroll |
| 8 | Receipt | The page is a long thermal receipt | The receipt feeds out of the printer in steps |
| 9 | Herbarium | Pressed coffee specimens on botanical sheets | A coffee branch grows, leaf by leaf, then fruits |
| 10 | Kissa | A quiet listening cafe, almost no decoration | A curtain of five strips parts over the photo |

### Design tokens

Hex values are light / dark.

| # | Background | Text | Accent | Second colour | Display type | Body type | Photos |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `#E4E8F7` / `#12163A` | `#1B2260` / `#F2EDD7` | `#B8660A` / `#F5B84B` | `#4A5BC4` / `#8FA3E8` | IM Fell English | Jost | Circular portholes, tinted indigo |
| 2 | `#F6C22D` / `#07332C` | `#0B3B32` / `#FFF4C9` | `#D32F2B` / `#FF6A5C` | `#0B5D4E` / `#FFD23F` | Rozha One | Mukta | Full colour, thick painted frames |
| 3 | `#E9EBE6` / `#16173B` | `#1F2A8C` / `#F4F4FF` | `#FF4C8B` / `#FF5C97` | `#1F4DD8` / `#FFE14D` | Bowlby One | Familjen Grotesk | Two-colour halftone |
| 4 | `#FFCE1F` / `#0A1E3A` | `#141414` / `#F4F6F8` | `#141414` / `#FFC53D` | `#FFFFFF` / `#16335C` | Archivo Expanded | Archivo | High-contrast black and white |
| 5 | `#F0F4F7` / `#23302E` | `#1B2430` / `#E9EDE3` | `#D8342C` / `#F08A8A` | `#1D3FA8` / `#F4D35E` | Kalam | Karla | Taped prints, slightly crooked |
| 6 | `#F4CFC0` / `#06363B` | `#143F40` / `#F7DDD0` | `#0F6B6B` / `#D9AE55` | `#A57A1F` / `#F2C9BA` | Limelight | Josefin Sans | Arched windows, warm tone |
| 7 | `#FCE9B2` / `#2A1420` | `#3A1F12` / `#FCE9B2` | `#E4572E` / `#FF7A4D` | `#2E7F7A` / `#4DB8B0` | Shrikhand | Sen | Circles and pills, saturated |
| 8 | `#1D3FD1` / `#0B1438` | `#111111` / `#E8ECEF` | Paper `#FAFAF5` / `#1A1D2B` | | Courier Prime | Courier Prime, Libre Barcode 39 | True 1-bit dither |
| 9 | `#DCE6D2` / `#10261C` | `#1E3A2A` / `#DDE8D2` | `#B3123A` / `#F0527A` | `#6D8A6F` / `#8FB08F` | Cormorant Garamond | Alegreya Sans | Pressed under paper straps |
| 10 | `#DEDCD6` / `#1C1F24` | `#1C2230` / `#D8D6CE` | `#A8321F` / `#BFA968` | `#5F6B45` / `#7F8A66` | Shippori Mincho | Shippori Mincho | Natural, very large, lots of air |

### Layout concepts

```
1 Night Chart           2 Meter Kaapi           3 Riso Zine             4 Departures
 title  ( dial )        [==SIGNBOARD==]         TITLE (2 inks)          |flaps flaps flaps|
 text   ( 4am  )        headline  pour SVG      [sheet][sheet]          |time coffee  bags|
 chart: stars by        [ menu board ... ₹ ]      [sheet][sheet]        |time coffee  bags|
 altitude and roast     [ ticket form ]         comic strip, coupon     o---o---o---o route

5 Cupping Notes         6 Marine Drive          7 Supergraphic          8 Receipt
 o| title    [photo]        /\ sunburst /\      ≈≈≈≈≈≈ stripes ≈≈≈≈     photo  |~~~~~~|  photo
 o| scribbles  ~~>          ( arch )            HUGE title   (photo)    stubs  |items |  stubs
 o| radar + tabs          ODD HOUR              (o) capsule row                |barcd |
 o| checklist           ∩ ∩ ∩ ∩ windows         (o) capsule row                |~~~~~~|

9 Herbarium             10 Kissa
 [sheet: branch]  Title  O  [      photo     ]
 [sheet][  sheet ]       d
    [sheet]   [sheet]    d  list      one photo
 (labels bottom right)      <- drag rail ->
```

### Checked against the usual defaults

Things that came out generic on the first pass, and what changed:

- **Warm cream paper with a serif and terracotta** was the first instinct for Herbarium and Kissa.
  Herbarium moved to celadon green with cherry red; Kissa to cool plaster grey with indigo ink.
- **Near-black with one bright accent** was the first instinct for Departures. It is now railway
  navy with amber flaps, and its light mode is full signal yellow, not white.
- **Identical rounded cards** would have been the easy way to show the four coffees. Each theme
  now has a form specific to its world: chart stars, menu board, zine pages, timetable rows,
  scorecards, arched windows, capsules, line items, specimen sheets, a plain list.
- **Numbered markers** appear only where the content really is a sequence (the four batch steps)
  or where the world demands it (receipt lines, the user's own theme numbers).
- **Monospace and all caps** appear only where the object they imitate uses them: the receipt and
  the departure board.
