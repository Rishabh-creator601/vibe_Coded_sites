"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { Engine } from "../../shared/scoring.js";
import { playKey } from "@/lib/sound";
import { useSettings } from "./useSettings";

interface Options {
  text: string;
  code?: boolean;
  /** Countdown in seconds; null for runs that end by finishing the text. */
  limitSeconds?: number | null;
  /** Called once when the run ends. `elapsedMs` is the time to score over. */
  onFinish: (engine: Engine, elapsedMs: number) => void;
  /** When false, keys are ignored (e.g. a test that hasn't been issued yet). */
  enabled?: boolean;
}

/** Wires the shared typing Engine to React: keyboard handling, timer, live stats. */
export function useTypingEngine({ text, code = false, limitSeconds = null, onFinish, enabled = true }: Options) {
  const { settings } = useSettings();
  const [runKey, setRunKey] = useState(0);
  const [tick, rerender] = useReducer((n: number) => n + 1, 0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const engine = useMemo(() => new Engine(text, { code }), [text, code, runKey]);

  useEffect(() => {
    startRef.current = null;
    setElapsedMs(0);
  }, [engine]);

  const finish = useCallback(
    (ms: number) => {
      if (engine.status === "finished" && startRef.current === -1) return;
      engine.finish();
      startRef.current = -1; // marks "already reported"
      setElapsedMs(ms);
      onFinishRef.current(engine, ms);
      rerender();
    },
    [engine],
  );

  // timer: ticks while running, ends the run when the countdown reaches zero
  useEffect(() => {
    if (engine.status !== "running") return;
    const id = setInterval(() => {
      if (startRef.current == null || startRef.current < 0) return;
      const ms = performance.now() - startRef.current;
      if (limitSeconds && ms >= limitSeconds * 1000) finish(limitSeconds * 1000);
      else setElapsedMs(ms);
    }, 200);
    return () => clearInterval(id);
  }, [engine, engine.status, limitSeconds, finish]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || !text || engine.status === "finished") return;
      if (e.key === "Tab") return; // moves focus to the restart button
      if (e.key === "Escape") {
        e.preventDefault();
        if (!limitSeconds && engine.status === "running" && startRef.current != null) finish(performance.now() - startRef.current);
        return;
      }
      let key = e.key;
      const altGr = e.getModifierState?.("AltGraph");
      if ((e.ctrlKey || e.metaKey) && !altGr) {
        if (key !== "Backspace") return e.preventDefault();
        key = "Ctrl+Backspace";
      }
      const typable = key.length === 1 || key === "Backspace" || key === "Ctrl+Backspace" || (code && key === "Enter");
      if (!typable) return;
      e.preventDefault();
      if (e.repeat && key.length === 1) return;

      const now = performance.now();
      const wasIdle = engine.status === "idle";
      if (!wasIdle && limitSeconds && startRef.current != null && now - startRef.current >= limitSeconds * 1000) {
        return finish(limitSeconds * 1000);
      }
      const t = wasIdle ? 0 : Math.round(now - (startRef.current as number));
      const before = engine.errorsByKey;
      const errorsBefore = Object.values(before).reduce((a, b) => a + b, 0);
      if (!engine.press(key, t)) return;
      if (wasIdle) startRef.current = now;
      if (settings.sound) playKey(Object.values(engine.errorsByKey).reduce((a, b) => a + b, 0) > errorsBefore);

      if ((engine.status as string) === "finished") finish(t); // press() finishes the engine on the last char
      else rerender();
    },
    [enabled, text, engine, limitSeconds, code, finish, settings.sound],
  );

  const restart = useCallback(() => setRunKey((k) => k + 1), []);
  const live = engine.status === "idle" ? { netWpm: 0, rawWpm: 0, accuracy: 0 } : engine.summary(Math.max(elapsedMs, 1));

  return {
    engine,
    tick,
    handleKeyDown,
    restart,
    status: engine.status,
    elapsedMs,
    timeLeftMs: limitSeconds ? Math.max(0, limitSeconds * 1000 - elapsedMs) : null,
    live,
  };
}
