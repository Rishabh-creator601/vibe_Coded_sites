import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { API_URL } from "@/lib/api";
import { durationLabel, round1, shortDate } from "@/lib/format";
import type { TestResult } from "@/types";
import ResultView, { LevelStatus } from "@/components/results/ResultView";
import ShareButton from "@/components/results/ShareButton";
import { LinkButton } from "@/components/ui/Button";

async function load(id: string): Promise<TestResult | null> {
  const res = await fetch(`${API_URL}/tests/${id}`, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return null;
  return (await res.json()).result;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = await load((await params).id);
  if (!r) return { title: "Result not found" };
  return { title: `${r.userName}: ${Math.round(r.netWpm)} wpm on ${r.levelName}`, description: `${round1(r.netWpm)} wpm at ${round1(r.accuracy)}% accuracy, ${durationLabel(r.duration)} test.` };
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await load(id);
  if (!r) notFound();

  return (
    <div className="pt-6">
      <h1 className="text-4xl font-bold tracking-tight">
        {r.levelName}, {durationLabel(r.duration)} test
      </h1>
      <p className="mb-8 mt-2 text-sub">
        {r.userName}, {r.date ? shortDate(r.date) : ""}
      </p>
      <ResultView r={r}>
        <div className="flex flex-col gap-3">
          {r.status === "flagged" ? (
            <p className="rounded-lg border border-err px-4 py-3 text-err">This result couldn&apos;t be verified and won&apos;t count toward the leaderboard.</p>
          ) : (
            <>
              {r.personalBest && <p className="rounded-lg border border-accent px-4 py-3">New personal best for {r.levelName} ({durationLabel(r.duration)}).</p>}
              <LevelStatus level={r.level} passed={r.levelPassed} netWpm={r.netWpm} accuracy={r.accuracy} newlyUnlocked={r.newlyUnlocked} />
            </>
          )}
          <div className="flex flex-wrap gap-3">
            <LinkButton href={`/test/${r.level}`} variant="primary">
              Retry {r.levelName}
            </LinkButton>
            <LinkButton href="/test">Pick another level</LinkButton>
            <LinkButton href="/practice/weak-keys">Practice weak keys</LinkButton>
            <ShareButton />
          </div>
        </div>
      </ResultView>
    </div>
  );
}
