"use client";

import { memo, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Engine } from "../../../shared/scoring.js";

const Word = memo(function Word({ idx, expected, typed, passed }: { idx: number; expected: string; typed: string; passed: boolean }) {
  const n = Math.max(expected.length, typed.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    let cls: string;
    if (i >= typed.length) cls = passed ? "text-err/70 underline decoration-err/70" : "text-muted";
    else if (i >= expected.length) cls = "text-err-dark underline";
    else if (typed[i] === expected[i]) cls = "text-fg";
    else cls = "text-err underline";
    out.push(
      <span key={i} data-pos={`${idx}-${i}`} className={cls}>
        {i < expected.length ? expected[i] : typed[i]}
      </span>,
    );
  }
  return <span className="inline-block whitespace-pre">{out}</span>;
});

interface Props {
  engine: Engine;
  /** Changes whenever the engine changes, so the memoised words re-render. */
  tick: number;
  onKeyDown: (e: KeyboardEvent) => void;
  disabled?: boolean;
}

/** Renders the text from engine state, with a hidden input that captures keys and a sliding caret. */
export default function TypingArea({ engine, tick, onKeyDown, disabled }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!disabled) input.current?.focus();
  }, [engine, disabled]);

  // keep the nav quiet while a run is in progress
  useEffect(() => {
    document.body.dataset.typing = engine.status === "running" ? "true" : "false";
    return () => {
      document.body.dataset.typing = "false";
    };
  }, [engine.status, tick, engine]);

  // place the caret and keep the active line on the second of three visible lines
  useLayoutEffect(() => {
    const root = inner.current;
    const c = caret.current;
    if (!root || !c) return;
    const w = engine.wordIndex;
    const typedLen = engine.typed[w]?.length ?? 0;
    const prev = typedLen > 0 ? root.querySelector<HTMLElement>(`[data-pos="${w}-${typedLen - 1}"]`) : null;
    const next = root.querySelector<HTMLElement>(`[data-pos="${w}-0"]`);
    const ref = prev ?? next;
    if (!ref) return;
    const lineH = parseFloat(getComputedStyle(box.current!).lineHeight) || 40;
    const offset = Math.max(0, ref.offsetTop - lineH);
    root.style.transform = `translateY(${-offset}px)`;
    c.style.left = `${ref.offsetLeft + (prev ? ref.offsetWidth : 0)}px`;
    c.style.top = `${ref.offsetTop + lineH * 0.15}px`;
    c.style.height = `${lineH * 0.7}px`;
  }, [engine, tick, focused]);

  return (
    <div
      className="relative cursor-text"
      onClick={() => input.current?.focus()}
      data-testid="typing-area"
    >
      <input
        ref={input}
        aria-label="Typing input. Type the text shown."
        className="absolute inset-0 h-full w-full opacity-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onKeyDown={onKeyDown}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        onChange={(e) => (e.target.value = "")}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
      />
      <div
        ref={box}
        aria-hidden
        className={`overflow-hidden font-mono transition-[filter] duration-200 ${focused || engine.status === "finished" ? "" : "blur-[3px]"}`}
        style={{ fontSize: "var(--typing-size)", lineHeight: "1.7", height: "calc(var(--typing-size) * 1.7 * 3)" }}
      >
        <div ref={inner} className="relative flex flex-wrap content-start gap-x-[0.7ch] transition-transform duration-150 motion-reduce:transition-none">
          <div ref={caret} className={`caret ${engine.status === "idle" ? "idle" : ""}`} />
          {engine.words.map((w, i) => (
            <span key={i} className="contents">
              {w.lineStart && <span className="basis-full h-0" />}
              {w.indent > 0 && <span style={{ width: `${w.indent}ch` }} className="inline-block" />}
              <Word idx={i} expected={w.expected} typed={engine.typed[i]} passed={i < engine.wordIndex} />
            </span>
          ))}
        </div>
      </div>
      {!focused && engine.status !== "finished" && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center text-sub">Click here or press any key to start typing</div>
      )}
      <p className="sr-only" aria-live="polite">
        {engine.status === "finished" ? "Finished" : ""}
      </p>
    </div>
  );
}
