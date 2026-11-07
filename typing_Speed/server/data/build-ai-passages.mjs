// One-off helper that writes ai-passages.json: extra Expert practice text written by an LLM.
// It needs the LLM API running (see llm-website-api/README.md). The site itself never calls the model.
// Run from typing_Speed: node server/data/build-ai-passages.mjs --count 16
// Then read the result before committing: the checks below catch broken text, not bad writing.
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const API_URL = process.env.LLM_API_URL || "http://127.0.0.1:7860";
const OUTPUT = new URL("./ai-passages.json", import.meta.url);
const SOURCE = "Written by AI (Qwen3-4B)";
const ATTEMPTS_PER_TOPIC = 3;
const MIN_WORDS = 40;
const MAX_WORDS = 85;

// Invented everyday scenes, so there are no facts for the model to get wrong.
const TOPICS = [
  "a rainy morning at a small bus station",
  "an old bookshop just before closing time",
  "a fisherman mending nets on a quiet shore",
  "a street market waking up at dawn",
  "a child learning to ride a bicycle",
  "a baker starting work in the dark",
  "a long train journey through the mountains",
  "a power cut on a hot summer evening",
  "two neighbours sharing a garden fence",
  "a lighthouse keeper watching a storm arrive",
  "a student packing for a first day away from home",
  "a cat exploring an empty house",
  "a village festival seen from a rooftop",
  "a tailor finishing a wedding coat at midnight",
  "a lost umbrella passing from stranger to stranger",
  "snow falling on a town that rarely sees it",
  "an old clock being repaired in a tiny workshop",
  "a hiker reaching a mountain hut at sunset",
  "a grandmother teaching a family recipe",
  "a musician practising alone in an empty hall",
  "a small boat crossing a misty lake",
  "a painter choosing colours for a blank wall",
  "a crowded kitchen before a big family dinner",
  "a farmer watching clouds gather over dry fields",
];

const prompt = (topic) =>
  // The model tends to overshoot, so this asks for less than MAX_WORDS allows.
  `Write one short paragraph of about 45 words, three sentences at most, about ${topic}. It is practice text for a typing test.
Rules:
- Vivid, natural English in complete sentences, with varied sentence lengths.
- Use a semicolon, a colon or a dash at least once, plus some commas.
- Invent everything: no real people, places, brands, dates or numbers.
- Only the paragraph itself: no title, no quotes around it, no line breaks, no markdown.`;

const REPLACEMENTS = [
  [/[‘’]/g, "'"],
  [/[“”]/g, '"'],
  [/\s*[–—]\s*/g, " - "],
  [/…/g, "..."],
];

const hasRepeatedPhrase = (words) => {
  const seen = new Set();
  for (let i = 0; i + 5 <= words.length; i++) {
    const phrase = words.slice(i, i + 5).join(" ").toLowerCase();
    if (seen.has(phrase)) return true;
    seen.add(phrase);
  }
  return false;
};

/** Tidies a model reply into typeable text. Returns { text } or { problem } when it can't be used. */
export function cleanPassage(raw) {
  let text = String(raw);
  for (const [from, to] of REPLACEMENTS) text = text.replace(from, to);
  text = text.replace(/\s+/g, " ").trim();
  if (/^".*"$/.test(text) && !text.slice(1, -1).includes('"')) text = text.slice(1, -1);

  if (/[^\x20-\x7E]/.test(text)) return { problem: "has characters that aren't on a standard keyboard" };
  if (/[*#_`<>[\]{}|\\]/.test(text)) return { problem: "has markdown or code symbols" };
  if (/\d/.test(text)) return { problem: "has numbers" };
  if (!/^[A-Z"]/.test(text)) return { problem: "doesn't start like a sentence" };
  if (!/[.!?]"?$/.test(text)) return { problem: "doesn't end like a sentence" };
  if ((text.match(/"/g) ?? []).length % 2) return { problem: "has an unclosed quote" };
  if ((text.match(/\(/g) ?? []).length !== (text.match(/\)/g) ?? []).length) return { problem: "has an unclosed bracket" };

  const words = text.split(" ");
  if (words.length < MIN_WORDS || words.length > MAX_WORDS) return { problem: `has ${words.length} words` };
  if (hasRepeatedPhrase(words)) return { problem: "repeats itself" };
  return { text };
}

async function ask(content) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(process.env.LLM_API_KEY && { Authorization: `Bearer ${process.env.LLM_API_KEY}` }) },
    body: JSON.stringify({ messages: [{ role: "user", content }], temperature: 0.8 }),
  });
  if (!res.ok) throw new Error(`LLM API returned ${res.status}: ${await res.text()}`);

  let reply = "";
  let buffer = "";
  for await (const chunk of res.body.pipeThrough(new TextDecoderStream())) {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      reply += JSON.parse(line.slice(6)).choices?.[0]?.delta?.content ?? "";
    }
  }
  return reply;
}

async function waitUntilReady() {
  for (let i = 0; i < 60; i++) {
    const ready = await fetch(`${API_URL}/health`).then((r) => r.ok, () => false);
    if (ready) return;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`The LLM API at ${API_URL} isn't ready`);
}

async function main() {
  const flag = process.argv.indexOf("--count");
  const count = flag === -1 ? TOPICS.length : Number(process.argv[flag + 1]);
  if (!Number.isInteger(count) || count < 1 || count > TOPICS.length) throw new Error(`--count must be between 1 and ${TOPICS.length}`);

  await waitUntilReady();
  const passages = [];
  for (const topic of TOPICS) {
    if (passages.length === count) break;
    for (let attempt = 1; attempt <= ATTEMPTS_PER_TOPIC; attempt++) {
      const { text, problem } = cleanPassage(await ask(prompt(topic)));
      if (problem) {
        console.log(`rejected (${problem}): ${topic}, attempt ${attempt}`);
        continue;
      }
      passages.push({ id: `ai${String(passages.length + 1).padStart(3, "0")}`, text, source: SOURCE });
      // Saved after each one, so a stopped run keeps what it has.
      fs.writeFileSync(OUTPUT, `${JSON.stringify(passages, null, 2)}\n`);
      console.log(`${passages.length}/${count}: ${topic}`);
      break;
    }
  }
  if (passages.length < count) throw new Error(`Only ${passages.length} of ${count} passages passed the checks`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
