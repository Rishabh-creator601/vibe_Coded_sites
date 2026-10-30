import type { Metadata } from "next";

export const metadata: Metadata = { title: "How scoring works" };

export default function AboutPage() {
  return (
    <article className="max-w-2xl pt-6 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_p]:mt-3 [&_p]:text-sub [&_strong]:text-fg">
      <h1 className="text-4xl font-bold tracking-tight">How scoring works</h1>

      <h2>A word is five characters</h2>
      <p>
        Like most typing tests, we count every 5 characters (spaces included) as one word, so long and short words are treated fairly.
      </p>

      <h2>Net WPM is the headline number</h2>
      <p>
        <strong>Net WPM</strong> counts only the characters that are correct in your final text, divided by 5, per minute. A typo you leave in costs you speed.
      </p>
      <p>
        <strong>Raw WPM</strong> counts every key you pressed, right or wrong. The gap between raw and net shows how much mistakes cost you.
      </p>

      <h2>Accuracy remembers every mistake</h2>
      <p>
        Accuracy is the share of key presses that were right at the moment you pressed them. Fixing a typo with backspace keeps your net WPM up, but the mistake still counts against accuracy.
      </p>

      <h2>Consistency</h2>
      <p>How steady your speed was from second to second. 100% means a perfectly even pace; lower numbers mean bursts and stalls.</p>

      <h2>Tests are scored on the server</h2>
      <p>
        In Test mode your browser sends the full list of key presses and we recalculate everything ourselves. Results that look impossible, such as speeds above 250 WPM or perfectly robotic timing, are saved but flagged, and they don&apos;t count for unlocks or the leaderboard.
      </p>

      <h2>Passing a level</h2>
      <p>Pass a level by reaching its target speed and accuracy in any scored test. Passing opens the levels that come after it. Practice is always open on every level.</p>
    </article>
  );
}
