import { ROWS, baseKey } from "@/lib/keyboard";

/** Highlights the key to press next (practice only). */
export default function OnScreenKeyboard({ next }: { next: string | null }) {
  const target = next === null ? "" : baseKey(next);
  const key = (k: string, extra = "") => (
    <div
      key={k}
      className={`flex h-9 items-center justify-center rounded-md border border-line font-mono text-sm ${extra} ${
        target === k ? "border-accent bg-accent text-accent-ink" : "bg-panel text-sub"
      }`}
    >
      {k === "space" ? "" : k}
    </div>
  );
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-1.5" aria-hidden>
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5" style={{ paddingLeft: `${i * 1.1}rem` }}>
          {row.map((k) => key(k, "w-9"))}
        </div>
      ))}
      <div className="flex justify-center">{key("space", "w-64")}</div>
    </div>
  );
}
