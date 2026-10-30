# Practice and Test Modes

Back to [PLAN.md](../PLAN.md)

---

## 1. Side-by-side

| | Practice | Test |
|---|---|---|
| Purpose | Learn and improve | Official, scored attempt |
| Who | Everyone (guests too) | Logged-in users only |
| Levels | All 7, always open | Only unlocked levels |
| Length | Time: 15 / 30 / 60 / 120s · Words: 10 / 25 / 50 / 100 · Full passage · Untimed | 1, 3 or 5 minutes |
| Text | Random, regenerate anytime | Issued by the server, fixed for the attempt |
| Backspace | Yes | Yes (corrected errors still lower accuracy) |
| Live WPM | Shown | Shown |
| Live accuracy | Shown | Hidden until the end |
| On-screen keyboard | Optional, highlights the next key | Hidden |
| Restart | Anytime (Tab → Enter) | Counts as abandoned |
| Saved | Guests: localStorage · Users: database | Database, with full keystroke log |
| Affects unlocks | No | Yes |
| Leaderboard | No | Yes |

---

## 2. Practice mode

### 2.1 Flow
1. `/practice`: grid of 7 level cards (name, sample text, your best WPM if any).
2. Click a level → `/practice/[level]`.
3. Choose an option bar at the top: **time | words | passage | untimed** (plus stage for Beginner, language for Code).
4. Typing starts on the first keystroke; there's no countdown.
5. Run ends when the time is up, the word count is reached or the passage is finished.
6. Results panel replaces the text (see §4).
7. **Enter** = next run with new text · **Tab → Enter** = restart the same text.

### 2.2 Weak-keys drill
- Available from the practice page and the dashboard.
- Uses the user's 5 most-missed keys (from `GET /api/users/me/weak-keys`, or localStorage for guests).
- Builds text from Easy/Medium words that contain those keys, so roughly half the words contain at least one weak key.
- Shows the targeted keys above the text: "Drilling: e, r, ;, b, p".
- Needs at least 300 typed characters of history; before that, shows "Type a bit more so we can find your weak keys".

### 2.3 What gets saved
```
level, option (e.g. "time:30"), netWpm, rawWpm, accuracy,
durationMs, charsTyped, errorsByKey, createdAt
```
No keystroke log for practice; it isn't needed and would bloat storage.

Guests: last 50 sessions in localStorage under `ts_practice_history`. After registering, a one-time prompt offers to import them.

---

## 3. Test mode

### 3.1 Flow
1. `/test`: grid of levels; locked ones are greyed out with "Pass Medium to unlock".
2. Pick a level → `/test/[level]` → pick a duration (1 / 3 / 5 min) → **Start test**.
3. Client calls `POST /api/tests/start` → gets `testId` and the text.
4. Screen shows the text with the caret on the first letter: "Start typing when ready." The timer starts on the first keystroke.
5. Timer counts down. Live WPM is shown; accuracy is hidden.
6. When time runs out, input locks and the client sends the keystroke log to `POST /api/tests/:id/submit`.
7. Server scores it and returns the result → redirect to `/results/[id]`.

### 3.2 Rules
- **Paste, drop and autocomplete are blocked** on the input.
- **Leaving the tab:** if the tab is hidden for more than 5 seconds, the test is cancelled and marked abandoned. A warning shows at the start.
- **Abandoning:** leaving the page or restarting marks the attempt `abandoned`. Abandoned attempts are kept but not shown in best scores.
- **Expiry:** a `testId` can only be submitted once, and only within `duration + 60s` of the first keystroke.
- **Rate limit:** max 30 test starts per user per hour.

### 3.3 What gets saved
Everything in Practice, plus: `testId`, the text seed, the full keystroke log, `status` (`started | completed | abandoned | flagged`), and `flagReason` if flagged.

---

## 4. Results screen (both modes)

| Block | Content |
|---|---|
| Headline | **Net WPM** (large), accuracy, raw WPM |
| Details | Time, characters (correct / incorrect / extra / missed), consistency |
| Chart | WPM per second (net and raw lines), red dots where errors happened |
| Missed keys | Top 5 keys with error count, small keyboard heatmap |
| Level status (test) | Passed / not passed, with the target shown |
| Personal best | "New personal best for Hard (1 min)!" when it applies |
| Actions | Next · Retry · Share (test only) · Practice weak keys |

Guests see a "Sign up to save your progress and take tests" banner under the results.
