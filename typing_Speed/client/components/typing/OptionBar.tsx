"use client";

import type { PracticeOption } from "@/types";

const TIMES = [15, 30, 60, 120];
const WORDS = [10, 25, 50, 100];

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${active ? "bg-accent text-accent-ink" : "text-sub hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

interface Props {
  option: PracticeOption;
  onOption: (o: PracticeOption) => void;
  levelId: string;
  stage: string;
  onStage: (s: string) => void;
  lang: string;
  onLang: (l: string) => void;
}

const STAGES = [
  ["1a", "Home row"],
  ["1b", "+ Top row"],
  ["1c", "+ Bottom row"],
  ["1d", "All letters"],
];

export default function OptionBar({ option, onOption, levelId, stage, onStage, lang, onLang }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-line bg-panel px-3 py-2" role="group" aria-label="Run options">
      <div className="flex items-center gap-1">
        <span className="px-2 text-sm text-sub">Time</span>
        {TIMES.map((v) => (
          <Pill key={v} active={option.kind === "time" && option.value === v} onClick={() => onOption({ kind: "time", value: v })}>
            {v}s
          </Pill>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="px-2 text-sm text-sub">Words</span>
        {WORDS.map((v) => (
          <Pill key={v} active={option.kind === "words" && option.value === v} onClick={() => onOption({ kind: "words", value: v })}>
            {v}
          </Pill>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <Pill active={option.kind === "passage"} onClick={() => onOption({ kind: "passage" })}>
          Passage
        </Pill>
        <Pill active={option.kind === "untimed"} onClick={() => onOption({ kind: "untimed" })}>
          Untimed
        </Pill>
      </div>
      {levelId === "beginner" && (
        <div className="flex items-center gap-1">
          {STAGES.map(([id, label]) => (
            <Pill key={id} active={stage === id} onClick={() => onStage(id)}>
              {label}
            </Pill>
          ))}
        </div>
      )}
      {levelId === "code" && (
        <div className="flex items-center gap-1">
          {[
            ["both", "JS + Python"],
            ["js", "JavaScript"],
            ["python", "Python"],
          ].map(([id, label]) => (
            <Pill key={id} active={lang === id} onClick={() => onLang(id)}>
              {label}
            </Pill>
          ))}
        </div>
      )}
    </div>
  );
}
