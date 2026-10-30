"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, post, ApiError } from "@/lib/api";
import { durationLabel } from "@/lib/format";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import type { Engine, Keystroke } from "../../../shared/scoring.js";
import { TEST_DURATIONS, getLevel } from "../../../shared/levels.js";
import { Button } from "../ui/Button";
import StatsBar from "./StatsBar";
import TypingArea from "./TypingArea";

type Stage = "intro" | "starting" | "run" | "submitting" | "error";

export default function TestRunner({ levelId }: { levelId: string }) {
  const router = useRouter();
  const level = getLevel(levelId)!;
  const [duration, setDuration] = useState(60);
  const [stage, setStage] = useState<Stage>("intro");
  const [attempt, setAttempt] = useState<{ testId: string; text: string } | null>(null);
  const [message, setMessage] = useState("");
  const [touch, setTouch] = useState(false);
  const attemptRef = useRef<string | null>(null); // live (unsubmitted) test id
  const logRef = useRef<Keystroke[]>([]);

  useEffect(() => setTouch(window.matchMedia("(pointer: coarse)").matches), []);

  const abandon = useCallback((id: string | null) => {
    if (id) post(`/tests/${id}/abandon`).catch(() => {});
  }, []);

  const submit = useCallback(
    async (id: string) => {
      setStage("submitting");
      try {
        await post(`/tests/${id}/submit`, { keystrokes: logRef.current });
        attemptRef.current = null;
        router.push(`/results/${id}`);
      } catch (e) {
        if (e instanceof ApiError && ["ALREADY_SUBMITTED", "TEST_EXPIRED", "FORBIDDEN"].includes(e.code)) attemptRef.current = null;
        setMessage(e instanceof Error ? e.message : "Couldn't submit your test.");
        setStage("error");
      }
    },
    [router],
  );

  const onFinish = useCallback(
    (engine: Engine) => {
      logRef.current = [...engine.keystrokes];
      if (attemptRef.current) submit(attemptRef.current);
    },
    [submit],
  );

  const t = useTypingEngine({ text: attempt?.text ?? "", code: levelId === "code", limitSeconds: duration, onFinish, enabled: stage === "run" });

  async function start() {
    setStage("starting");
    setMessage("");
    try {
      const r = await post<{ testId: string; text: string }>("/tests/start", { level: levelId, duration });
      attemptRef.current = r.testId;
      setAttempt(r);
      setStage("run");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't start the test.");
      setStage("intro");
    }
  }

  function cancel(note: string) {
    abandon(attemptRef.current);
    attemptRef.current = null;
    setAttempt(null);
    setMessage(note);
    setStage("intro");
  }

  // leaving the tab for more than 5 seconds cancels the test
  useEffect(() => {
    if (stage !== "run") return;
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > 5000 && t.engine.status !== "finished") cancel("Test cancelled because the tab was hidden for more than 5 seconds.");
    };
    const onHide = () => {
      if (attemptRef.current && t.engine.status !== "finished") navigator.sendBeacon(`${API_URL}/tests/${attemptRef.current}/abandon`);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, t.engine]);

  // leaving this page mid-test abandons it
  useEffect(() => () => abandon(attemptRef.current), [abandon]);

  if (stage === "intro" || stage === "starting") {
    return (
      <div className="flex max-w-xl flex-col gap-6">
        {message && <p className="rounded-lg border border-err px-4 py-3 text-err">{message}</p>}
        <fieldset>
          <legend className="mb-2 font-bold">How long?</legend>
          <div className="flex gap-3">
            {TEST_DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={duration === d}
                onClick={() => setDuration(d)}
                className={`keycap px-5 py-3 font-mono font-bold ${duration === d ? "!border-accent text-accent" : "text-sub"}`}
              >
                {durationLabel(d)}
              </button>
            ))}
          </div>
        </fieldset>
        <ul className="list-disc space-y-1 pl-5 text-sub">
          <li>
            Pass {level.name} with {level.passWpm} wpm at {level.passAcc}% accuracy to unlock the next levels.
          </li>
          <li>The clock starts on your first key. Accuracy stays hidden until the end.</li>
          <li>Pasting is blocked. Hiding the tab for more than 5 seconds cancels the test.</li>
          <li>Backspace works, but mistakes you fix still count against your accuracy.</li>
        </ul>
        {touch && <p className="text-err">For accurate results, use a device with a physical keyboard.</p>}
        <div>
          <Button variant="primary" onClick={start} disabled={stage === "starting"}>
            {stage === "starting" ? "Getting your text" : "Start test"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <StatsBar status={t.status} wpm={t.live.netWpm} timeMs={t.timeLeftMs ?? 0} elapsedMs={t.elapsedMs} countdown />
      {t.status === "idle" && <p className="text-sub">Start typing when ready.</p>}
      <TypingArea engine={t.engine} tick={t.tick} onKeyDown={t.handleKeyDown} disabled={stage !== "run"} />
      {stage === "submitting" && (
        <p className="text-sub" role="status">
          Calculating your score
        </p>
      )}
      {stage === "error" && (
        <div className="rounded-lg border border-err px-4 py-3">
          <p className="text-err">{message}</p>
          <div className="mt-3 flex gap-3">
            {attemptRef.current && (
              <Button variant="primary" onClick={() => submit(attemptRef.current!)}>
                Retry submit
              </Button>
            )}
            <Button onClick={() => cancel("")}>Back to start</Button>
          </div>
        </div>
      )}
      {stage === "run" && (
        <div>
          <Button
            onClick={() => {
              cancel("");
            }}
          >
            Restart (abandons this test)
          </Button>
        </div>
      )}
    </div>
  );
}
