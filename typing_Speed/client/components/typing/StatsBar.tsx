import { formatTime } from "@/lib/format";

interface Props {
  status: string;
  wpm: number;
  accuracy?: number;
  /** Remaining ms for timed runs; elapsed ms otherwise. */
  timeMs: number;
  elapsedMs: number;
  countdown: boolean;
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-mono text-3xl font-bold tabular-nums ${accent ? "text-accent" : "text-fg"}`}>{value}</span>
      <span className="text-sm text-sub">{label}</span>
    </div>
  );
}

/** Time (or countdown), live WPM and, in practice, accuracy. WPM stays blank for the first 2 seconds. */
export default function StatsBar({ status, wpm, accuracy, timeMs, elapsedMs, countdown }: Props) {
  const running = status !== "idle";
  const showWpm = running && elapsedMs >= 2000;
  return (
    <div className="flex flex-wrap items-baseline gap-x-8 gap-y-1" aria-label="Live stats">
      <Stat value={formatTime(timeMs)} label={countdown ? "left" : "elapsed"} accent />
      <Stat value={showWpm && wpm > 0 ? String(Math.round(wpm)) : "-"} label="wpm" />
      {accuracy !== undefined && <Stat value={running && accuracy > 0 ? `${Math.round(accuracy)}%` : "-"} label="accuracy" />}
    </div>
  );
}
