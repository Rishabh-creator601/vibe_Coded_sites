# Typing Engine and Scoring

Back to [PLAN.md](../PLAN.md)

---

## 1. Terms

| Term | Meaning |
|---|---|
| Keystroke | Any key that types a character (letters, digits, symbols, space, Enter in Code). Backspace is logged but is not a keystroke for scoring. |
| Correct keystroke | A keystroke that matched the expected character **at the moment it was pressed** |
| Correct char | A character that is correct in the **final** typed text (after any corrections) |
| Incorrect char | A character that is wrong in the final text |
| Extra char | Typed past the end of a word (e.g. `thee` for `the`) |
| Missed char | Skipped when the user pressed space early (e.g. `th ` for `the `) |
| Elapsed time | From the first keystroke to the end (time-up or last character typed) |

---

## 2. Formulas

A "word" is 5 characters, including spaces. This is the standard used by most typing tests.

```
minutes      = elapsedMs / 60000
rawWpm       = (totalKeystrokes / 5) / minutes
netWpm       = (correctChars / 5) / minutes
accuracy     = correctKeystrokes / totalKeystrokes × 100
consistency  = 100 − (stdDev(wpmPerSecond) / mean(wpmPerSecond) × 100), clamped to 0–100
```

- `netWpm` is the headline number.
- `accuracy` counts **every** mistake, even ones fixed with backspace. Fixing errors makes your final text clean and keeps net WPM up, but accuracy remembers them.
- All values are rounded to 1 decimal place for display and stored unrounded.
- If `totalKeystrokes = 0`, all values are 0 (no divide-by-zero).
- In Practice mode, the first 2 seconds don't show live WPM (numbers jump around too much when time is tiny).

### Worked example
1-minute test. The user pressed 310 character keys; 295 matched at the time they were pressed. After backspacing, the final text has 290 correct characters.

| | Calculation | Result |
|---|---|---|
| Raw WPM | 310 / 5 / 1 | **62.0** |
| Net WPM | 290 / 5 / 1 | **58.0** |
| Accuracy | 295 / 310 × 100 | **95.2%** |

---

## 3. Typing engine (`useTypingEngine`)

### 3.1 State
```ts
type CharState = "pending" | "correct" | "incorrect" | "extra";

interface EngineState {
  words: { expected: string; typed: string; chars: CharState[] }[];
  wordIndex: number;
  charIndex: number;
  status: "idle" | "running" | "finished";
  startTime: number | null;
  keystrokes: { k: string; t: number }[];   // t = ms since first keystroke
  correctKeystrokes: number;
  totalKeystrokes: number;
  errorsByKey: Record<string, number>;      // keyed by the EXPECTED char
  wpmPerSecond: { s: number; net: number; raw: number; errors: number }[];
}
```

### 3.2 Input handling
- A hidden `<input>` keeps focus and captures keys; the visible text is rendered from state.
- Uses `keydown` with `event.key` (works across keyboard layouts).
- Ignored: modifier keys alone, arrow keys, Ctrl/Cmd shortcuts (except Ctrl+Backspace).

| Key | Behaviour |
|---|---|
| Character | Compare to expected char → mark correct / incorrect / extra, advance caret |
| Space | Move to next word; any untyped chars in the current word become **missed**. Space on the first char of a word is ignored (no empty words). |
| Backspace | Delete the last char of the current word. At the start of a word, go back to the previous word **only if it has an error**. |
| Ctrl+Backspace | Delete the whole current word |
| Enter | Code level only: next line + auto-indent |

### 3.3 Timing
- Timer starts on the first keystroke (not on page load).
- `performance.now()` for keystroke timestamps (monotonic, not affected by clock changes).
- Live stats update every 250 ms via `requestAnimationFrame`, not on every key, to keep typing smooth.
- A per-second snapshot goes into `wpmPerSecond` for the results chart.

### 3.4 Finish conditions
| Option | Finishes when |
|---|---|
| Time | Countdown hits 0 |
| Words | Last word's last char is typed (no space needed) |
| Passage | Last char of the passage is typed |
| Untimed | Same as passage, or user presses Esc → Finish |

---

## 4. Server-side scoring (Test mode)

The client's numbers are only for display. For tests the server does the real calculation:

1. Load the attempt by `testId` → get the stored text and duration.
2. **Replay** the keystroke log through `shared/scoring.js` (the same code the client uses) against the stored text.
3. Elapsed time = `min(last keystroke t, duration)`. Keystrokes after the duration are dropped.
4. Compute net WPM, raw WPM, accuracy, consistency and `errorsByKey`.
5. Run the checks in §5.
6. Save the result and return it.

Because the code is shared, a client and server given the same log must produce identical numbers. This is unit-tested.

### Keystroke log format
```json
[
  { "k": "t", "t": 0 },
  { "k": "h", "t": 112 },
  { "k": "r", "t": 230 },
  { "k": "Backspace", "t": 410 },
  { "k": "e", "t": 520 }
]
```
Size check: 5 minutes at 120 WPM ≈ 3,000 entries ≈ 60 KB of JSON. Request body limit: 200 KB.

---

## 5. Anti-cheat checks

| Check | Rule | Result if it fails |
|---|---|---|
| Single use | `testId` already submitted | Reject (409) |
| Ownership | Attempt belongs to a different user | Reject (403) |
| Expiry | Submitted later than `startedAt + duration + 60s` | Reject (410) |
| Real time | Server time between start and submit is shorter than the log's last `t` minus 2s | Flag |
| Max speed | Net WPM > 250 | Flag |
| Robotic timing | Std dev of gaps between keystrokes < 8 ms over 50+ keystrokes | Flag |
| Impossible gaps | More than 20 gaps under 10 ms | Flag |
| Log consistency | Log is empty, `t` not increasing, or unknown keys | Reject (400) |

Flagged results are saved with `status: "flagged"` and a `flagReason`. They don't count for unlocks, personal bests or the leaderboard. The user sees: "This result couldn't be verified and won't count toward the leaderboard."

---

## 6. Unit test cases for `shared/scoring.js`

- Perfect typing → accuracy 100, net = raw
- One typo fixed with backspace → net unchanged, accuracy < 100
- One typo left in → net < raw
- Space pressed mid-word → missed chars counted, net drops
- Extra chars at end of a word → counted as incorrect
- Zero keystrokes → all 0
- Keystrokes after the time limit → ignored
- Code level: Enter + auto-indent → indentation spaces not required from the user
