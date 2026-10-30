"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { bestLocalWpm } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import type { LevelInfo } from "@/types";
import { LEVELS } from "../../../shared/levels.js";
import LevelCard, { LEVEL_BLURB } from "@/components/ui/LevelCard";
import { LinkButton } from "@/components/ui/Button";

export default function PracticePage() {
  const { user } = useAuth();
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [local, setLocal] = useState<Record<string, number | null>>({});

  useEffect(() => {
    get<{ levels: LevelInfo[] }>("/levels").then((r) => setLevels(r.levels)).catch(() => {});
  }, [user]);
  useEffect(() => setLocal(Object.fromEntries(LEVELS.map((l) => [l.id, bestLocalWpm(l.id)]))), []);

  return (
    <div className="pt-6">
      <h1 className="text-4xl font-bold tracking-tight">Practice</h1>
      <p className="mt-2 max-w-xl text-sub">Every level is open here. Nothing you type in practice affects unlocks or the leaderboard.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LEVELS.map((l) => {
          const info = levels.find((x) => x.id === l.id);
          const best = user ? info?.bestPracticeWpm : local[l.id];
          return <LevelCard key={l.id} id={l.id} name={l.name} href={`/practice/${l.id}`} blurb={LEVEL_BLURB[l.id]} best={best} detail="No score yet" />;
        })}
      </div>
      <div className="mt-10 max-w-xl">
        <h2 className="text-lg font-bold">Weak-key drill</h2>
        <p className="mt-1 text-sub">Text built around the five keys you miss most.</p>
        <div className="mt-3">
          <LinkButton href="/practice/weak-keys">Drill my weak keys</LinkButton>
        </div>
      </div>
    </div>
  );
}
