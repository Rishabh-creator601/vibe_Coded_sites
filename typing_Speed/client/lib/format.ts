export const round1 = (n: number | null | undefined) => (n == null ? "-" : (Math.round(n * 10) / 10).toFixed(1));
export const wpm = (n: number | null | undefined) => (n == null ? "-" : String(Math.round(n)));

export const durationLabel = (sec: number) => `${sec / 60} min`;

export function formatTime(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function formatTotalTime(ms: number) {
  const min = Math.round(ms / 60000);
  return min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;
}

export const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export const optionLabel = (o: string) => {
  const [kind, v] = o.split(":");
  if (kind === "time") return `${v}s`;
  if (kind === "words") return `${v} words`;
  return o === "weak-drill" ? "weak-key drill" : o;
};
