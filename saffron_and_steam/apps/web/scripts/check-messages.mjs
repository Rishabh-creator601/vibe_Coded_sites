// Fails if any translation key is missing from one of the language files.
// Run with: npm run check:messages -w web
import { readFileSync } from "node:fs";

const LOCALES = ["en", "hi", "bn", "mr", "te"];
const load = (l) => JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url), "utf8"));
const keys = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

const base = new Set(keys(load("en")));
let failed = false;
for (const l of LOCALES.slice(1)) {
  const own = new Set(keys(load(l)));
  const missing = [...base].filter((k) => !own.has(k));
  const extra = [...own].filter((k) => !base.has(k));
  if (missing.length || extra.length) {
    failed = true;
    if (missing.length) console.error(`${l}.json is missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`${l}.json has keys not in en.json: ${extra.join(", ")}`);
  }
}
if (failed) process.exit(1);
console.log(`All ${LOCALES.length} message files have the same ${base.size} keys.`);
