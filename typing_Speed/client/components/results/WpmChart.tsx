"use client";

import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import type { SecondPoint } from "../../../shared/scoring.js";

/** Net and raw WPM per second, with a red dot at every second that had mistakes. */
export default function WpmChart({ data }: { data: SecondPoint[] }) {
  if (data.length < 2) return <p className="text-sm text-sub">Not enough time typed to draw a chart.</p>;
  const rows = data.map((d) => ({ ...d, net: Math.round(d.net), raw: Math.round(d.raw), miss: d.errors > 0 ? Math.round(d.raw) : null }));
  return (
    <div className="h-64 w-full" role="img" aria-label="Words per minute over time">
      <ResponsiveContainer>
        <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="s" stroke="var(--muted)" tickLine={false} unit="s" />
          <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} />
          <Line type="monotone" dataKey="raw" name="Raw wpm" stroke="var(--muted)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="net" name="Net wpm" stroke="var(--accent)" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Scatter dataKey="miss" name="Mistakes" fill="var(--error)" isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
