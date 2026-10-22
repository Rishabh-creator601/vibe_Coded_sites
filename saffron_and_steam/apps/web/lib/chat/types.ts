// Shapes shared by the chat widget and POST /api/chat, plus the checks the route runs
// on everything the browser sends.

import { CUISINES, LOCALES, type Cuisine, type Diet, type Locale, type MealPeriodKey } from "@saffron/shared";

/** The questions the bot asks, in order. */
export const STEPS = ["name", "party", "meal", "cuisine", "diet"] as const;
export type Step = (typeof STEPS)[number];

export const MEALS: MealPeriodKey[] = ["breakfast", "lunch", "dinner"];

/** "egg" is vegetarian plus egg dishes; "any" adds meat and fish. */
export const DIET_CHOICES = ["veg", "vegan", "egg", "any"] as const;
export type DietChoice = (typeof DIET_CHOICES)[number];

/** Which menu diets each choice allows. Same rule as the menu page's veg filter. */
export const DIET_ALLOWS: Record<DietChoice, Diet[]> = {
  vegan: ["vegan"],
  veg: ["veg", "vegan"],
  egg: ["veg", "vegan", "egg"],
  any: ["veg", "vegan", "egg", "nonVeg"],
};

export const MAX_PARTY = 20;

/** What the guest has told the bot so far. */
export interface Profile {
  name?: string;
  party?: number;
  meal?: MealPeriodKey;
  /** Empty means "surprise me": any cuisine. */
  cuisines?: Cuisine[];
  diet?: DietChoice;
}

export function nextStep(p: Profile): Step | null {
  if (!p.name) return "name";
  if (!p.party) return "party";
  if (!p.meal) return "meal";
  if (!p.cuisines) return "cuisine";
  if (!p.diet) return "diet";
  return null;
}

export interface HistoryTurn {
  role: "user" | "bot";
  text: string;
}

export interface ChatRequest {
  locale: Locale;
  profile: Profile;
  /** Typed text. */
  message?: string;
  /** A tapped quick-reply chip: the answer is already structured. */
  answer?: Profile;
  history: HistoryTurn[];
}

/** Shown from the language files when the AI is off, unsure or failing. */
export type Fallback = "summary" | "found" | "noAnswer" | "error" | "busy";

export interface ChatReply {
  profile: Profile;
  /** Written by the AI from the retrieved café notes, in the guest's language. */
  text: string | null;
  fallback?: Fallback;
  /** Dish slugs for the Visualizer. Cards read names, photos and prices from the menu, never from the AI. */
  picks: string[];
  /** True when the guest has just answered every question. */
  done: boolean;
  /** The next question, while some are still unanswered. */
  ask: Step | null;
}

export const MAX_MESSAGE = 500;

export function cleanName(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const name = raw.replace(/[^\p{L}\p{M}\s.'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 40);
  return name || undefined;
}

/** Keeps only fields with allowed values. */
export function cleanProfile(raw: unknown): Profile {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const p: Profile = {};
  const name = cleanName(r.name);
  if (name) p.name = name;
  if (Number.isInteger(r.party) && (r.party as number) >= 1) p.party = Math.min(r.party as number, MAX_PARTY);
  if (MEALS.includes(r.meal as MealPeriodKey)) p.meal = r.meal as MealPeriodKey;
  if (Array.isArray(r.cuisines)) p.cuisines = CUISINES.filter((c) => (r.cuisines as unknown[]).includes(c));
  if (DIET_CHOICES.includes(r.diet as DietChoice)) p.diet = r.diet as DietChoice;
  return p;
}

export function parseChatRequest(raw: unknown): ChatRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!LOCALES.includes(r.locale as Locale)) return null;
  const message = typeof r.message === "string" ? r.message.trim().slice(0, MAX_MESSAGE) : undefined;
  const answer = r.answer ? cleanProfile(r.answer) : undefined;
  if (!message && !answer) return null;
  const history = (Array.isArray(r.history) ? r.history : [])
    .slice(-8)
    .flatMap((h): HistoryTurn[] =>
      h && (h.role === "user" || h.role === "bot") && typeof h.text === "string" && h.text.trim() ? [{ role: h.role, text: h.text.slice(0, MAX_MESSAGE) }] : [],
    );
  return { locale: r.locale as Locale, profile: cleanProfile(r.profile), message, answer, history };
}
