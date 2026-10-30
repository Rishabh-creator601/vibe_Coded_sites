import type { ReactNode } from "react";
import type { RunResult } from "@/types";
import { round1 } from "@/lib/format";
import { getLevel } from "../../../shared/levels.js";
import WpmChart from "./WpmChart";
import KeyHeatmap from "./KeyHeatmap";

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-sm text-sub">{label}</div>
    </div>
  );
}

export function LevelStatus({ level, passed, netWpm, accuracy, newlyUnlocked }: { level: string; passed: boolean; netWpm: number; accuracy: number; newlyUnlocked: string[] }) {
  const l = getLevel(level);
  if (!l) return null;
  if (passed) {
    const names = newlyUnlocked.map((id) => getLevel(id)?.name).filter(Boolean).join(" and ");
    return (
      <p className="rounded-lg border border-accent px-4 py-3 text-fg">
        Level passed. {names ? `${names} ${newlyUnlocked.length > 1 ? "are" : "is"} now unlocked.` : `You've already unlocked everything this level opens.`}
      </p>
    );
  }
  return (
    <p className="rounded-lg border border-line px-4 py-3 text-sub">
      You need {l.passWpm} wpm at {l.passAcc}% accuracy to pass {l.name}. You got {Math.round(netWpm)} wpm at {Math.round(accuracy)}%.
    </p>
  );
}

/** Headline numbers, chart and missed keys, shared by practice runs and the test result page. */
export default function ResultView({ r, children }: { r: Omit<RunResult, "durationMs">; children?: ReactNode }) {
  const missed = Object.entries(r.errorsByKey).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end gap-x-14 gap-y-6">
        <div>
          <div className="font-mono text-7xl font-bold leading-none tabular-nums text-accent sm:text-8xl">{round1(r.netWpm)}</div>
          <div className="mt-2 text-sub">net words per minute</div>
        </div>
        <Figure value={`${round1(r.accuracy)}%`} label="accuracy" />
        <Figure value={round1(r.rawWpm)} label="raw wpm" />
        <Figure value={`${Math.round(r.consistency)}%`} label="consistency" />
      </div>

      {children}

      <section aria-labelledby="chart-h">
        <h2 id="chart-h" className="mb-3 text-lg font-bold">
          Speed over time
        </h2>
        <WpmChart data={r.wpmPerSecond} />
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold">Characters</h2>
          <p className="font-mono text-sub">
            <span className="text-fg">{r.chars.correct}</span> correct / <span className="text-err">{r.chars.incorrect}</span> wrong /{" "}
            <span className="text-err-dark">{r.chars.extra}</span> extra / {r.chars.missed} skipped
          </p>
          <h2 className="mb-3 mt-8 text-lg font-bold">Most missed keys</h2>
          {missed.length ? (
            <ul className="flex flex-wrap gap-2">
              {missed.map(([k, n]) => (
                <li key={k} className="keycap flex items-center gap-2 px-3 py-1.5 font-mono">
                  <span className="text-fg">{k === " " ? "space" : k}</span>
                  <span className="text-sm text-err">{n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sub">No missed keys. Clean run.</p>
          )}
        </section>
        <KeyHeatmap values={r.errorsByKey} />
      </div>
      <p className="sr-only" aria-live="polite">
        Result: {round1(r.netWpm)} words per minute at {round1(r.accuracy)} percent accuracy.
      </p>
    </div>
  );
}
