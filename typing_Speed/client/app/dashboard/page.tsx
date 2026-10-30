"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { get } from "@/lib/api";
import { durationLabel, formatTotalTime, optionLabel, round1, shortDate, wpm } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import KeyHeatmap from "@/components/results/KeyHeatmap";
import { LinkButton } from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import type { WeakKey } from "@/types";
import { LEVELS, getLevel } from "../../../shared/levels.js";

interface Stats {
  totals: { tests: number; practiceSessions: number; timeTypingMs: number };
  best: { level: string; duration: number; netWpm: number; accuracy: number; testId: string }[];
  last10: { avgNetWpm: number | null; avgAccuracy: number | null };
}
interface HistoryItem {
  type: "test" | "practice";
  id: string;
  level: string;
  duration?: number;
  option?: string;
  status?: string;
  netWpm: number;
  accuracy: number;
  createdAt: string;
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-3xl font-bold tabular-nums">{value}</div>
      <div className="text-sm text-sub">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState("30");
  const [progress, setProgress] = useState<{ date: string; netWpm: number }[]>([]);
  const [weak, setWeak] = useState<{ keys: WeakKey[]; enoughData: boolean } | null>(null);
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<{ items: HistoryItem[]; total: number; limit: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([get<Stats>("/users/me/stats"), get<{ keys: WeakKey[]; enoughData: boolean }>("/users/me/weak-keys")])
      .then(([s, w]) => {
        setStats(s);
        setWeak(w);
      })
      .catch((e) => setError(e.message));
  }, [user]);

  useEffect(() => {
    if (user) get<{ days: { date: string; netWpm: number }[] }>(`/users/me/progress?days=${days}`).then((r) => setProgress(r.days)).catch(() => {});
  }, [user, days]);

  useEffect(() => {
    if (user) get<typeof history>(`/users/me/history?page=${page}&limit=10${type !== "all" ? `&type=${type}` : ""}`).then(setHistory).catch(() => {});
  }, [user, type, page]);

  if (loading || !user) return null;
  if (error) return <p className="pt-6 text-err">{error}</p>;
  if (!stats) return <p className="pt-6 text-sub">Loading your stats</p>;

  const heat = Object.fromEntries((weak?.keys ?? []).map((k) => [k.key, k.rate]));
  const bestByLevel = LEVELS.map((l) => ({ level: l, runs: stats.best.filter((b) => b.level === l.id).sort((a, b) => a.duration - b.duration) }));
  const lastPage = history ? Math.max(1, Math.ceil(history.total / history.limit)) : 1;

  return (
    <div className="flex flex-col gap-14 pt-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Hi, {user.name}</h1>
        <div className="mt-6 flex flex-wrap gap-x-12 gap-y-4">
          <Figure value={String(stats.totals.tests)} label="tests completed" />
          <Figure value={String(stats.totals.practiceSessions)} label="practice runs" />
          <Figure value={formatTotalTime(stats.totals.timeTypingMs)} label="time typing" />
          <Figure value={wpm(stats.last10.avgNetWpm)} label="avg wpm, last 10 tests" />
        </div>
      </div>

      {stats.totals.tests === 0 && (
        <div>
          <p className="text-fg">No tests yet. Take your first test to see your stats here.</p>
          <div className="mt-3">
            <LinkButton href="/test" variant="primary">
              Take a test
            </LinkButton>
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">Best scores</h2>
        <table className="w-full max-w-2xl text-left">
          <thead>
            <tr className="border-b border-line text-sm text-sub">
              <th className="py-2 font-medium">Level</th>
              {[60, 180, 300].map((d) => (
                <th key={d} className="py-2 text-right font-medium">
                  {durationLabel(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {bestByLevel.map(({ level, runs }) => (
              <tr key={level.id} className="border-b border-line/60">
                <td className="py-2.5 font-sans">
                  {level.name} {user.passedLevels.includes(level.id) && <span className="text-sm text-accent">passed</span>}
                </td>
                {[60, 180, 300].map((d) => {
                  const r = runs.find((x) => x.duration === d);
                  return (
                    <td key={d} className="py-2.5 text-right">
                      {r ? (
                        <Link href={`/results/${r.testId}`} className="hover:text-accent">
                          {round1(r.netWpm)}
                        </Link>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold">Progress</h2>
          <Tabs label="Range" active={days} onSelect={setDays} tabs={[{ id: "30", label: "30 days" }, { id: "90", label: "90 days" }, { id: "365", label: "1 year" }]} />
        </div>
        {progress.length < 2 ? (
          <p className="text-sub">Complete tests on at least two different days to see your progress line.</p>
        ) : (
          <div className="h-64 w-full" role="img" aria-label="Average net WPM per day">
            <ResponsiveContainer>
              <LineChart data={progress.map((p) => ({ ...p, netWpm: Math.round(p.netWpm * 10) / 10 }))} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted)" tickLine={false} />
                <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} />
                <Line type="monotone" dataKey="netWpm" name="Net wpm" stroke="var(--accent)" strokeWidth={3} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-bold">Weak keys</h2>
          {weak?.enoughData && weak.keys.length > 0 ? (
            <>
              <ul className="mb-5 flex flex-wrap gap-2">
                {weak.keys.slice(0, 5).map((k) => (
                  <li key={k.key} className="keycap px-3 py-1.5 font-mono">
                    {k.key} <span className="text-sm text-err">{Math.round(k.rate * 100)}%</span>
                  </li>
                ))}
              </ul>
              <LinkButton href="/practice/weak-keys" variant="primary">
                Drill these keys
              </LinkButton>
            </>
          ) : (
            <p className="text-sub">Type a bit more so we can find your weak keys.</p>
          )}
        </div>
        <KeyHeatmap values={heat} />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold">History</h2>
          <Tabs
            label="History type"
            active={type}
            onSelect={(t) => {
              setType(t);
              setPage(1);
            }}
            tabs={[{ id: "all", label: "All" }, { id: "test", label: "Tests" }, { id: "practice", label: "Practice" }]}
          />
        </div>
        {history && history.items.length === 0 ? (
          <p className="text-sub">Nothing here yet.</p>
        ) : (
          <table className="w-full max-w-2xl text-left">
            <thead>
              <tr className="border-b border-line text-sm text-sub">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Run</th>
                <th className="py-2 text-right font-medium">WPM</th>
                <th className="py-2 text-right font-medium">Accuracy</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {history?.items.map((h) => (
                <tr key={`${h.type}${h.id}`} className="border-b border-line/60">
                  <td className="py-2.5 font-sans text-sub">{shortDate(h.createdAt)}</td>
                  <td className="py-2.5 font-sans">
                    {h.type === "test" ? (
                      <Link href={`/results/${h.id}`} className="hover:text-accent">
                        {getLevel(h.level)?.name}, {durationLabel(h.duration!)} test{h.status === "flagged" ? " (not verified)" : ""}
                      </Link>
                    ) : (
                      <>
                        {getLevel(h.level)?.name}, practice {optionLabel(h.option!)}
                      </>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-bold">{round1(h.netWpm)}</td>
                  <td className="py-2.5 text-right">{round1(h.accuracy)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {lastPage > 1 && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <button className="text-sub hover:text-fg disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span className="text-sub">
              Page {page} of {lastPage}
            </span>
            <button className="text-sub hover:text-fg disabled:opacity-40" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
