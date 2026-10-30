import { ImageResponse } from "next/og";
import { API_URL } from "@/lib/api";

export const alt = "Typing test result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_URL}/tests/${id}`, { cache: "no-store" }).catch(() => null);
  const r = res?.ok ? (await res.json()).result : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#0f1115", color: "#e6e6e6" }}>
        <div style={{ fontSize: 36, color: "#9aa1ad" }}>
          {r ? `${r.userName} on ${r.levelName}, ${r.duration / 60} min` : "Keystone typing test"}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 20 }}>
          <div style={{ fontSize: 260, fontWeight: 700, color: "#f5c542", lineHeight: 1 }}>{r ? Math.round(r.netWpm) : "?"}</div>
          <div style={{ fontSize: 56, marginLeft: 28, color: "#9aa1ad" }}>wpm</div>
        </div>
        <div style={{ fontSize: 48, marginTop: 24 }}>{r ? `${Math.round(r.accuracy)}% accuracy` : ""}</div>
      </div>
    ),
    size,
  );
}
