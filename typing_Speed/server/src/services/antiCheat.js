// Checks that don't reject a submission but flag it, see docs/SCORING.md section 5.
const MAX_NET_WPM = 250;

/** @returns {string | null} a flag reason, or null if the log looks human. */
export function detectCheating({ keystrokes, netWpm, serverElapsedMs }) {
  const lastT = keystrokes.length ? keystrokes[keystrokes.length - 1].t : 0;
  if (serverElapsedMs < lastT - 2000) return "Test finished faster than the clock allows";
  if (netWpm > MAX_NET_WPM) return `Speed above ${MAX_NET_WPM} WPM`;

  const gaps = [];
  for (let i = 1; i < keystrokes.length; i++) gaps.push(keystrokes[i].t - keystrokes[i - 1].t);
  if (gaps.length >= 50) {
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const sd = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length);
    if (sd < 8) return "Keystroke timing was too regular";
  }
  if (gaps.filter((g) => g < 10).length > 20) return "Too many keystrokes closer than 10 ms";
  return null;
}
