"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { get, post } from "@/lib/api";
import { addPractice } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { optionToString, type PracticeOption, type PracticeRecord, type RunResult } from "@/types";
import type { Engine } from "../../../shared/scoring.js";
import { Button } from "../ui/Button";
import ResultView from "../results/ResultView";
import OnScreenKeyboard from "./OnScreenKeyboard";
import OptionBar from "./OptionBar";
import StatsBar from "./StatsBar";
import TypingArea from "./TypingArea";

interface Props {
  levelId: string;
  /** Weak-key drill: text is built around these keys. */
  drillKeys?: string[];
  /** Landing page box: fixed 30-second run, no option bar. */
  demo?: boolean;
}

interface TextData {
  text: string;
  source: string | null;
}

export default function PracticeRunner({ levelId, drillKeys, demo }: Props) {
  const { user } = useAuth();
  const toast = useToast();
  const drill = !!drillKeys;
  const [option, setOption] = useState<PracticeOption>(drill ? { kind: "words", value: 50 } : { kind: "time", value: 30 });
  const [stage, setStage] = useState("1d");
  const [lang, setLang] = useState("both");
  const [data, setData] = useState<TextData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const optionKey = optionToString(option);
  const drillId = drillKeys?.join(",");

  useEffect(() => {
    let alive = true;
    setData(null);
    setLoadError("");
    setResult(null);
    const words = option.kind === "time" ? Math.ceil((option.value * 200) / 60) + 20 : option.kind === "words" ? option.value : 40;
    const q = new URLSearchParams({ words: String(words), passage: option.kind === "passage" || option.kind === "untimed" ? "1" : "0", stage, lang });
    const url = drillId ? `/practice/drill?keys=${encodeURIComponent(drillId)}` : `/practice/${levelId}/text?${q}`;
    get<TextData>(url)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setLoadError(e.message));
    return () => {
      alive = false;
    };
  }, [levelId, optionKey, stage, lang, drillId, nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFinish = useCallback(
    (engine: Engine, ms: number) => {
      const s = engine.stats(ms);
      setResult({ netWpm: s.netWpm, rawWpm: s.rawWpm, accuracy: s.accuracy, consistency: s.consistency, chars: s.chars, errorsByKey: s.errorsByKey, wpmPerSecond: s.wpmPerSecond, durationMs: ms });
      if (s.totalKeystrokes < 5) return;
      const rec: PracticeRecord = {
        level: levelId,
        option: drill ? "weak-drill" : optionKey,
        netWpm: s.netWpm,
        rawWpm: s.rawWpm,
        accuracy: s.accuracy,
        durationMs: ms,
        charsTyped: s.totalKeystrokes,
        errorsByKey: s.errorsByKey,
        keyCounts: s.keyCounts,
        createdAt: new Date().toISOString(),
      };
      if (user) post("/practice/sessions", rec).catch(() => toast("Couldn't save this run to your account."));
      else addPractice(rec);
    },
    [levelId, drill, optionKey, user, toast],
  );

  const limit = option.kind === "time" ? option.value : null;
  const t = useTypingEngine({ text: data?.text ?? "", code: levelId === "code", limitSeconds: limit, onFinish, enabled: !!data && !result });

  const next = useCallback(() => setNonce((n) => n + 1), []);
  const retry = useCallback(() => {
    setResult(null);
    t.restart();
  }, [t]);

  // Enter on the results screen starts the next run
  useEffect(() => {
    if (!result) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (e.key === "Enter" && tag !== "BUTTON" && tag !== "A") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, next]);

  const nextChar = useMemo(() => {
    const w = t.engine.words[t.engine.wordIndex];
    if (!w) return null;
    const typed = t.engine.typed[t.engine.wordIndex];
    return typed.length < w.expected.length ? w.expected[typed.length] : " ";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.engine, t.tick]);

  if (result) {
    return (
      <div className="flex flex-col gap-8">
        <ResultView r={result}>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={next} autoFocus>
              Next run
            </Button>
            <Button onClick={retry}>Retry same text</Button>
            {!drill && !demo && (
              <Link href="/practice/weak-keys" className="keycap inline-flex items-center px-5 py-2.5 text-sm">
                Practice weak keys
              </Link>
            )}
          </div>
        </ResultView>
        {!user && (
          <p className="rounded-lg border border-line px-4 py-3 text-sub">
            <Link href="/register" className="font-semibold text-accent underline">
              Sign up
            </Link>{" "}
            to save your progress and take scored tests.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {!demo && !drill && <OptionBar option={option} onOption={setOption} levelId={levelId} stage={stage} onStage={setStage} lang={lang} onLang={setLang} />}
      {drill && <p className="text-sub">Drilling: <span className="font-mono text-accent">{drillKeys!.join(", ")}</span></p>}

      <StatsBar
        status={t.status}
        wpm={t.live.netWpm}
        accuracy={t.live.accuracy}
        timeMs={t.timeLeftMs ?? t.elapsedMs}
        elapsedMs={t.elapsedMs}
        countdown={limit !== null}
      />

      {loadError ? (
        <p className="rounded-lg border border-err px-4 py-3 text-err">
          {loadError}{" "}
          <button className="underline" onClick={next}>
            Try again
          </button>
        </p>
      ) : !data ? (
        <div className="h-[calc(var(--typing-size)*1.7*3)] animate-pulse rounded-lg bg-panel" aria-label="Loading text" />
      ) : (
        <TypingArea engine={t.engine} tick={t.tick} onKeyDown={t.handleKeyDown} />
      )}

      {data?.source && <p className="text-sm text-sub">{data.source}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={retry} disabled={!data}>
          Restart
        </Button>
        <Button onClick={next} disabled={!data}>
          New text
        </Button>
        {!demo && (
          <label className="ml-auto flex items-center gap-2 text-sm text-sub">
            <input type="checkbox" checked={showKeyboard} onChange={(e) => setShowKeyboard(e.target.checked)} className="accent-[var(--accent)]" />
            Show keyboard
          </label>
        )}
      </div>

      {showKeyboard && !demo && <OnScreenKeyboard next={nextChar} />}
    </div>
  );
}
