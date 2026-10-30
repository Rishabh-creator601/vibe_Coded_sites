"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { LevelInfo } from "@/types";
import { LEVELS, getLevel } from "../../../shared/levels.js";
import LevelCard, { LEVEL_BLURB } from "@/components/ui/LevelCard";
import { LinkButton } from "@/components/ui/Button";

export default function TestPage() {
  const { user } = useAuth();
  const [levels, setLevels] = useState<LevelInfo[]>([]);

  useEffect(() => {
    get<{ levels: LevelInfo[] }>("/levels").then((r) => setLevels(r.levels)).catch(() => {});
  }, [user]);

  return (
    <div className="pt-6">
      <h1 className="text-4xl font-bold tracking-tight">Test</h1>
      <p className="mt-2 max-w-xl text-sub">Scored runs of 1, 3 or 5 minutes. Hit a level&apos;s target to unlock the levels after it.</p>
      {!user && (
        <p className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-line px-4 py-3">
          <span>Log in to take scored tests.</span>
          <LinkButton href="/login?next=/test" variant="primary">
            Log in
          </LinkButton>
        </p>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LEVELS.map((l) => {
          const info = levels.find((x) => x.id === l.id);
          const locked = !!info?.locked;
          const req = l.requires ? getLevel(l.requires)?.name : null;
          return (
            <LevelCard
              key={l.id}
              id={l.id}
              name={l.name}
              href={`/test/${l.id}`}
              blurb={LEVEL_BLURB[l.id]}
              detail={`Pass at ${l.passWpm} wpm, ${l.passAcc}%`}
              locked={locked}
              lockedNote={`Pass ${req} to unlock`}
              best={info?.bestWpm}
            />
          );
        })}
      </div>
    </div>
  );
}
