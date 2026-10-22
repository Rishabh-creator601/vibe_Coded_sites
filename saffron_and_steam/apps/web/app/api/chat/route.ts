import { respond } from "@/lib/chat/assistant";
import { parseChatRequest } from "@/lib/chat/types";

// The chatbot's one endpoint. It lives in Next.js for now; PLAN.md 9.6 moves it to
// POST /api/v1/assistant/chat on the Express API later.

const WINDOW_MS = 10 * 60_000;
const LIMIT = 30;
// Per-IP message times. In memory: enough for one server; the API will use a shared store.
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  return recent.length > LIMIT;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip)) return Response.json({ error: "busy" }, { status: 429 });

  const body = parseChatRequest(await request.json().catch(() => null));
  if (!body) return Response.json({ error: "invalid" }, { status: 400 });

  try {
    return Response.json(await respond(body));
  } catch (err) {
    console.error("[chat] turn failed", err);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
