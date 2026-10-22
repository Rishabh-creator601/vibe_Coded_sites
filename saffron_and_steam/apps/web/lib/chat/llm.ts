// The only file that talks to the AI provider (OpenAI). Swap this file to move to
// Gemini or Claude. Server-only: the key comes from apps/web/.env.local and is never
// sent to the browser.

const BASE = "https://api.openai.com/v1";
const EMBEDDING_MODEL = "text-embedding-3-small";

export function aiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

function chatModel(): string {
  return process.env.OPENAI_MODEL || "gpt-5.4-mini";
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(`OpenAI ${path} ${res.status}: ${err?.error?.message ?? res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** One vector per text. OpenAI's vectors are unit length, so a dot product is the cosine similarity. */
export async function embed(texts: string[]): Promise<number[][]> {
  const { data } = await post<{ data: { index: number; embedding: number[] }[] }>("/embeddings", { model: EMBEDDING_MODEL, input: texts });
  return data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** A chat completion whose reply must match `schema` (strict JSON schema). */
export async function chatJSON<T>(name: string, system: string, turns: ChatTurn[], schema: object): Promise<T> {
  const model = chatModel();
  const res = await post<{ choices: { message: { content: string | null; refusal?: string | null } }[] }>("/chat/completions", {
    model,
    // GPT-5.x models think before answering unless told not to; these replies are short.
    ...(/^gpt-5\.\d/.test(model) ? { reasoning_effort: "none" } : {}),
    max_completion_tokens: 500,
    messages: [{ role: "system", content: system }, ...turns],
    response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
  });
  const content = res.choices[0]?.message.content;
  if (!content) throw new Error(`OpenAI ${name}: empty reply (${res.choices[0]?.message.refusal ?? "no refusal"})`);
  return JSON.parse(content) as T;
}
