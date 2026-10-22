"use client";

import { Minus, Plus } from "lucide-react";

export function QtyStepper({
  value,
  onChange,
  min = 0,
  max = 20,
  label,
  decLabel,
  incLabel,
  format = String,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  decLabel: string;
  incLabel: string;
  format?: (n: number) => string;
}) {
  const btn = "flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <div className="inline-flex items-center rounded-full border-[1.5px] border-line bg-white" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={decLabel}>
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">
        {format(value)}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={incLabel}>
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
