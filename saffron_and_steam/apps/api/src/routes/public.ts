import { Router } from "express";
import {
  getCafeStatus,
  getItemAvailability,
  getZonedNow,
  LOCALES,
  makeReference,
  pick,
  quoteDelivery,
  type Locale,
} from "@saffron/shared";
import { z } from "zod";
import { notFound } from "../lib/http-error";
import { isDuplicateKey } from "../lib/tokens";
import { MessageModel, SubscriberModel } from "../models/inbox";
import { contactInput, deliveryQuoteInput, newsletterInput, parse } from "../schemas";
import { loadCategories, loadMenu, loadSettings } from "../services/catalog";

// Menu, settings, delivery quote, contact form and newsletter (PLAN.md section 8).

export const publicRouter = Router();

const menuQuery = z.object({
  category: z.string().max(40).optional(),
  diet: z.enum(["veg", "nonVeg", "vegan", "egg"]).optional(),
  q: z.string().trim().max(60).optional(),
  locale: z.enum(LOCALES).catch("en"),
});

/** All dishes with their text in every language; `q` searches names in `locale` (and English). */
publicRouter.get("/menu", async (req, res) => {
  const query = parse(menuQuery, req.query);
  const [categories, items, settings] = await Promise.all([loadCategories(), loadMenu(), loadSettings()]);
  const now = getZonedNow(settings.timezone);
  const q = query.q?.toLocaleLowerCase();
  const matches = (text: { en: string }) => [pick(text, query.locale as Locale), text.en].some((s) => s.toLocaleLowerCase().includes(q!));
  const filtered = items.filter(
    (item) =>
      (!query.category || item.category === query.category) &&
      (!query.diet || item.diet === query.diet) &&
      (!q || matches(item.name) || matches(item.description)),
  );
  res.json({
    categories,
    items: filtered.map((item) => ({ ...item, availableNow: getItemAvailability(item, settings, now).orderable })),
  });
});

publicRouter.get("/menu/featured", async (_req, res) => {
  const items = await loadMenu();
  res.json({ items: items.filter((i) => i.isFeatured) });
});

publicRouter.get("/menu/items/:slug", async (req, res) => {
  const item = (await loadMenu()).find((i) => i.slug === req.params.slug);
  if (!item) throw notFound("Dish");
  res.json({ item });
});

/** Hours, address, delivery zones and whether the café is serving right now. */
publicRouter.get("/settings/public", async (_req, res) => {
  const settings = await loadSettings();
  const now = getZonedNow(settings.timezone);
  res.json({ settings, now, status: getCafeStatus(settings, now) });
});

publicRouter.post("/delivery/quote", async (req, res) => {
  const { pincode, subtotal } = parse(deliveryQuoteInput, req.body);
  const quote = quoteDelivery(pincode, await loadSettings());
  res.json({ ...quote, meetsMinimum: quote.ok && subtotal !== undefined ? subtotal >= quote.minOrder : undefined });
});

publicRouter.post("/contact", async (req, res) => {
  const input = parse(contactInput, req.body);
  // Bots fill the hidden field; answer as if it worked so they learn nothing.
  if (input.company) return void res.status(201).json({ reference: "MSG-000000" });
  for (let attempt = 0; ; attempt++) {
    try {
      const reference = makeReference("MSG", getZonedNow((await loadSettings()).timezone).isoDate);
      await MessageModel.create({ reference, topic: input.topic, name: input.name, email: input.email, phone: input.phone ?? undefined, message: input.message });
      return void res.status(201).json({ reference });
    } catch (err) {
      if (!isDuplicateKey(err) || attempt >= 4) throw err;
    }
  }
});

/** Same answer whether or not the email was already subscribed, so the list can't be probed. */
publicRouter.post("/newsletter", async (req, res) => {
  const { email, company } = parse(newsletterInput, req.body);
  if (!company) await SubscriberModel.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  res.status(201).json({ subscribed: true });
});
