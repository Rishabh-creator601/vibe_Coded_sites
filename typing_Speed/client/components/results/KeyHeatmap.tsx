import { ROWS } from "@/lib/keyboard";

/** A keyboard with keys tinted by how often they were missed. `values` is keyed by character. */
export default function KeyHeatmap({ values }: { values: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(values));
  return (
    <div className="flex w-full max-w-xl flex-col gap-1.5" role="img" aria-label="Keyboard heatmap of missed keys">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1.5" style={{ paddingLeft: `${i * 1.1}rem` }}>
          {row.map((k) => {
            const v = (values[k] ?? 0) + (values[k.toUpperCase()] ?? 0);
            return (
              <div
                key={k}
                title={v ? `${k}: ${v}` : undefined}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-line font-mono text-sm text-sub"
                style={v ? { background: `color-mix(in srgb, var(--error) ${Math.round(25 + (v / max) * 65)}%, var(--panel))`, color: "var(--text)" } : { background: "var(--panel)" }}
              >
                {k}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
