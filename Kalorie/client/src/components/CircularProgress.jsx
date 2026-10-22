// Circular progress ring with the percentage shown in the centre (item 16).
// The colour interpolates from light red (0%) through amber to light green
// as the goal is reached (~98%+).
function colorForPct(pct) {
  const p = Math.max(0, Math.min(pct, 100));
  const hue = (p / 100) * 120; // 0deg = red → 120deg = green
  return `hsl(${hue}, 75%, 62%)`; // high lightness for the "light" red/green look
}

export default function CircularProgress({ value, target, label, unit = '' }) {
  const pct = target ? (value / target) * 100 : 0;
  const clamped = Math.max(0, Math.min(pct, 100));
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;
  const color = colorForPct(pct);

  return (
    <div className="card ring-card">
      <svg width="130" height="130" viewBox="0 0 130 130" className="ring">
        <circle className="ring-track" cx="65" cy="65" r={r} fill="none" strokeWidth="12" />
        <circle
          cx="65"
          cy="65"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
        />
        <text x="65" y="60" textAnchor="middle" className="ring-pct" fill={color}>
          {Math.round(pct)}%
        </text>
        <text x="65" y="82" textAnchor="middle" className="ring-sub">
          {Math.round(value)}
          {unit}
        </text>
      </svg>
      <div className="label">{label}</div>
      <div className="target">
        of {target}
        {unit} target
      </div>
    </div>
  );
}
