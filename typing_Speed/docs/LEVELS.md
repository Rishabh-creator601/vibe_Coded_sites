# Levels

Back to [PLAN.md](../PLAN.md)

There are 7 levels. Levels 1–5 form the main path, from easiest to hardest. Levels 6 and 7 are side tracks that open after Medium.

---

## 1. Level table

| # | Id | Name | Content | Pass target (test) | Unlocks after |
|---|---|---|---|---|---|
| 1 | `beginner` | Beginner | Letter drills by keyboard row | 15 WPM, 90% accuracy | Open from the start |
| 2 | `easy` | Easy | Top 200 common words, lowercase, no punctuation | 25 WPM, 90% | Beginner |
| 3 | `medium` | Medium | Top 1,000 words, some capitals, `. , ' ?` | 35 WPM, 92% | Easy |
| 4 | `hard` | Hard | Full sentences, longer words, all common punctuation | 45 WPM, 94% | Medium |
| 5 | `expert` | Expert | Real paragraphs and quotes, mixed case, `; : " ( ) -` | 60 WPM, 95% | Hard |
| 6 | `numbers` | Numbers & Symbols | Digits, prices, dates, times, `@ # $ % & * + =` | 30 WPM, 92% | Medium |
| 7 | `code` | Code | Short JavaScript and Python snippets | 30 WPM, 92% | Medium |

**Practice mode ignores locks**: every level is always open to practice. Locks only affect Test mode.

---

## 2. Level details

### 2.1 Beginner: row drills
Beginner has 4 stages so a new typist builds up one row at a time. Text is random "words" of 2–5 letters made from the allowed keys.

| Stage | Keys | Example |
|---|---|---|
| 1a | Home row: `a s d f j k l ;` | `dad fall sad ask lad ja` |
| 1b | + top row: `q w e r t y u i o p` | `ride tile pour drew` |
| 1c | + bottom row: `z x c v b n m , .` | `cave zinc move box` |
| 1d | All letters + space | `quick jumps over lazy` |

A Beginner test uses stage 1d. Practice lets the user pick any stage.

### 2.2 Easy
- 200 most common English words (the, and, you, that, was, for…)
- All lowercase, no punctuation
- Random order; no word appears twice in a row

### 2.3 Medium
- Top 1,000 words
- About 1 in 8 words capitalised
- Punctuation `. , ' ?` attached to words (e.g. `don't`, `today.`)
- A full stop is always followed by a capitalised word

### 2.4 Hard
- Real sentences from the passage bank (8–20 words each)
- Words up to 12 letters
- Punctuation: `. , ' ? ! ; :`

### 2.5 Expert
- Full paragraphs (public-domain books and quotes, with the source shown under the text)
- Mixed case, quotation marks, brackets, dashes
- No simplification: what's in the source is what you type

### 2.6 Numbers & Symbols
- Mix of words and number tokens: `$450`, `12/03/2025`, `9:45`, `42%`, `#17`, `a+b=c`, `user@mail.com`
- Number row and Shift+number symbols
- Only characters on a standard US keyboard (so `$`, not `₹`)

### 2.7 Code
- 5–15 line snippets in JavaScript and Python (user can pick one or both)
- Brackets, `=>`, `==`, `_`, quotes, indentation
- **Enter** moves to the next line and **auto-indents**, so users don't type leading spaces
- Tab is not used (it's the restart shortcut)

---

## 3. Text generation

| Mode | Where the text comes from |
|---|---|
| Practice | Client asks `GET /api/practice/:level/text`; for word levels the client can also generate locally from a cached word bank so restarts are instant |
| Test | Server generates it in `POST /api/tests/start` and stores it with the attempt |

**Test text length:** enough that nobody runs out: `200 WPM × duration in minutes` words (e.g. 600 words for a 3-min test). The UI shows only 3 lines at a time and scrolls as you type.

**Seeded randomness:** the generator takes a seed so a given test can be regenerated exactly (useful for debugging and for "retry this exact text" in practice).

---

## 4. Data file format

Stored in `server/data/` and loaded into memory when the server starts.

```
server/data/
├── beginner.json      # stage key sets
├── words-200.json     # Easy
├── words-1000.json    # Medium
├── sentences.json     # Hard
├── passages.json      # Expert
├── numbers.json       # Numbers & Symbols token templates
└── code/
    ├── js.json
    └── python.json
```

**Example: `passages.json`**
```json
[
  {
    "id": "p001",
    "text": "It was the best of times, it was the worst of times...",
    "source": "Charles Dickens, A Tale of Two Cities",
    "words": 118
  }
]
```

**Example: `code/js.json`**
```json
[
  {
    "id": "js001",
    "title": "Sum an array",
    "lines": [
      "function sum(nums) {",
      "  return nums.reduce((a, b) => a + b, 0);",
      "}"
    ]
  }
]
```

---

## 5. Shared level config

`shared/levels.js` is used by both client and server:

```js
export const LEVELS = [
  { id: "beginner", order: 1, name: "Beginner", passWpm: 15, passAcc: 90, requires: null },
  { id: "easy",     order: 2, name: "Easy",     passWpm: 25, passAcc: 90, requires: "beginner" },
  { id: "medium",   order: 3, name: "Medium",   passWpm: 35, passAcc: 92, requires: "easy" },
  { id: "hard",     order: 4, name: "Hard",     passWpm: 45, passAcc: 94, requires: "medium" },
  { id: "expert",   order: 5, name: "Expert",   passWpm: 60, passAcc: 95, requires: "hard" },
  { id: "numbers",  order: 6, name: "Numbers & Symbols", passWpm: 30, passAcc: 92, requires: "medium" },
  { id: "code",     order: 7, name: "Code",     passWpm: 30, passAcc: 92, requires: "medium" },
];
```

---

## 6. Unlock rules

- A level is **passed** when a completed (not flagged) test on it reaches both `passWpm` and `passAcc`.
- Any test duration counts (1, 3 or 5 min).
- Passing a level unlocks every level whose `requires` points to it.
- Unlocks are stored as a list on the user: `passedLevels: ["beginner", "easy"]`.
- The results screen shows "Level passed! Hard is now unlocked" or "You need 45 WPM at 94%. You got 41 WPM at 95%."
