import type { Metadata } from "next";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { round1 } from "@/lib/format";
import Tabs from "@/components/ui/Tabs";
import { LEVELS, TEST_DURATIONS } from "../../../shared/levels.js";

export const metadata: Metadata = { title: "Leaderboard" };

interface Entry {
  rank: number;
  name: string;
  netWpm: number;
  accuracy: number;
  testId: string;
  date: string;
}

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ level?: string; duration?: string; period?: string }> }) {
  const sp = await searchParams;
  const level = LEVELS.some((l) => l.id === sp.level) ? sp.level! : "medium";
  const duration = TEST_DURATIONS.includes(Number(sp.duration)) ? Number(sp.duration) : 60;
  const period = sp.period === "week" ? "week" : "all";

  const res = await fetch(`${API_URL}/leaderboard?level=${level}&duration=${duration}&period=${period}`, { next: { revalidate: 60 } }).catch(() => null);
  const entries: Entry[] | null = res?.ok ? (await res.json()).entries : null;

  const href = (o: Record<string, string | number>) => `/leaderboard?${new URLSearchParams({ level, duration: String(duration), period, ...Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)])) })}`;

  return (
    <div className="pt-6">
      <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
      <p className="mt-2 text-sub">Each person&apos;s best verified test. Practice runs don&apos;t count.</p>

      <div className="mt-6 flex flex-col gap-3">
        <Tabs label="Level" active={level} tabs={LEVELS.map((l) => ({ id: l.id, label: l.name, href: href({ level: l.id }) }))} />
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Tabs label="Duration" active={String(duration)} tabs={TEST_DURATIONS.map((d) => ({ id: String(d), label: `${d / 60} min`, href: href({ duration: d }) }))} />
          <Tabs label="Period" active={period} tabs={[{ id: "all", label: "All time", href: href({ period: "all" }) }, { id: "week", label: "This week", href: href({ period: "week" }) }]} />
        </div>
      </div>

      <div className="mt-8">
        {entries === null ? (
          <p className="text-err">Couldn&apos;t load the leaderboard. Refresh to try again.</p>
        ) : entries.length === 0 ? (
          <p className="text-fg">
            No scores yet for this level. Be the first!{" "}
            <Link href={`/test/${level}`} className="text-accent underline">
              Take the test
            </Link>
          </p>
        ) : (
          <table className="w-full max-w-2xl text-left">
            <caption className="sr-only">Top scores</caption>
            <thead>
              <tr className="border-b border-line text-sm text-sub">
                <th className="py-2 pr-4 font-medium">Rank</th>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 text-right font-medium">WPM</th>
                <th className="py-2 pr-4 text-right font-medium">Accuracy</th>
                <th className="py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {entries.map((e) => (
                <tr key={e.testId} className="border-b border-line/60">
                  <td className={`py-2.5 pr-4 ${e.rank === 1 ? "text-accent" : ""}`}>{e.rank}</td>
                  <td className="py-2.5 pr-4 font-sans">
                    <Link href={`/results/${e.testId}`} className="hover:text-accent">
                      {e.name}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-bold">{round1(e.netWpm)}</td>
                  <td className="py-2.5 pr-4 text-right">{round1(e.accuracy)}%</td>
                  <td className="py-2.5 text-sub">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
