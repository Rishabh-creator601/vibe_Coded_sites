// Retrieval for the chatbot. The café notes are embedded once, the first time someone
// chats, and kept in memory: under 80 short notes don't need a vector database. Without
// an API key (or if OpenAI fails) it falls back to matching words, so the bot still works.

import { demoMenu, type CategorySlug, type Cuisine, type MenuItem } from "@saffron/shared";
import { buildDocs, type Doc } from "./knowledge";
import { aiEnabled, embed } from "./llm";
import { DIET_ALLOWS, type Profile } from "./types";

interface Index {
  docs: Doc[];
  vectors: number[][] | null;
}

// On globalThis so dev-server reloads don't embed the notes again. Keyed by the notes'
// text, so a menu change is embedded afresh.
const cache = globalThis as typeof globalThis & { __saffronChatIndex?: { key: string; index: Promise<Index> } };

function getIndex(): Promise<Index> {
  const docs = buildDocs();
  if (!aiEnabled()) return Promise.resolve({ docs, vectors: null });
  const key = docs.map((d) => d.text).join("\n");
  if (cache.__saffronChatIndex?.key !== key) {
    const index = embed(docs.map((d) => d.text)).then(
      (vectors) => ({ docs, vectors }),
      (err) => {
        console.error("[chat] embedding the café notes failed; using word matching until the next try", err);
        cache.__saffronChatIndex = undefined;
        return { docs, vectors: null };
      },
    );
    cache.__saffronChatIndex = { key, index };
  }
  return cache.__saffronChatIndex!.index;
}

function dot(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

const words = (text: string) => text.toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];

/** Share of the query's words that appear in the note. */
function wordScore(query: string, doc: Doc) {
  const q = new Set(words(query).filter((w) => w.length > 2));
  if (!q.size) return 0;
  const d = new Set(words(doc.text));
  let hits = 0;
  for (const w of q) if (d.has(w)) hits++;
  return hits / q.size;
}

/** Every note, best match first: by meaning when embeddings are available, by shared words otherwise. */
async function rank(query: string): Promise<{ doc: Doc; score: number }[]> {
  const { docs, vectors } = await getIndex();
  let scores: number[] | null = null;
  if (vectors) {
    try {
      const [q] = await embed([query]);
      scores = vectors.map((v) => dot(q, v));
    } catch (err) {
      console.error("[chat] embedding the question failed; using word matching", err);
    }
  }
  scores ??= docs.map((d) => wordScore(query, d));
  return docs.map((doc, i) => ({ doc, score: scores[i] })).sort((a, b) => b.score - a.score);
}

/** The notes most relevant to a question. */
export async function search(query: string, k = 6): Promise<Doc[]> {
  return (await rank(query))
    .filter((r) => r.score > 0)
    .slice(0, k)
    .map((r) => r.doc);
}

/** With two or more chosen cuisines, alternate between them instead of filling up on one. */
function spread(items: MenuItem[], cuisines: Cuisine[]) {
  if (cuisines.length < 2) return items;
  const groups = cuisines.map((c) => items.filter((i) => i.cuisine === c));
  const mixed: MenuItem[] = [];
  for (let n = 0; groups.some((g) => n < g.length); n++) for (const g of groups) if (g[n]) mixed.push(g[n]);
  return [...mixed, ...items.filter((i) => !cuisines.includes(i.cuisine))];
}

/**
 * The Visualizer's spread: mains from the chosen meal, then drinks and a dessert, sized
 * for the party. Diet is a hard rule (a vegetarian never gets chicken); cuisine and the
 * similarity to what the guest asked for decide the order.
 */
export async function pickDishes(p: Profile): Promise<string[]> {
  const allowed = DIET_ALLOWS[p.diet ?? "any"];
  const cuisines = p.cuisines ?? [];
  const party = p.party ?? 2;
  const meal = p.meal ?? "lunch";

  const query = [
    cuisines.length ? `${cuisines.join(" and ")} food` : "the café's favourite dishes",
    `for ${meal}`,
    p.diet && p.diet !== "any" ? `, ${p.diet}` : "",
    `for ${party} people`,
  ].join(" ");
  const similarity = new Map((await rank(query)).flatMap((r) => (r.doc.slug ? [[r.doc.slug, r.score] as const] : [])));
  const value = (i: MenuItem) =>
    (similarity.get(i.slug) ?? 0) + (cuisines.includes(i.cuisine) ? 1 : 0) + (i.isFeatured || i.tags.includes("bestseller") ? 0.05 : 0);

  const best = (category: CategorySlug, count: number) =>
    spread(
      demoMenu.filter((i) => i.category === category && i.isAvailable && allowed.includes(i.diet)).sort((a, b) => value(b) - value(a)),
      cuisines,
    )
      .slice(0, count)
      .map((i) => i.slug);

  const mains = party <= 2 ? 2 : party <= 4 ? 3 : party <= 6 ? 4 : 5;
  return [...best(meal, mains), ...best("tea-coffee", party > 4 ? 2 : 1), ...best("desserts", party > 6 ? 2 : 1)];
}
