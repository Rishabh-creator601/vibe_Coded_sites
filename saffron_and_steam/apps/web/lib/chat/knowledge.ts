// The café notes the chatbot retrieves from (RAG): one note per dish, one per café
// photo, and short notes on hours, delivery, booking and ordering. Built from the same
// shared data the pages use, so the bot never disagrees with the menu.

import { demoCategories, demoMenu, demoSettings as s, formatPrice, LOCALES, type MenuItem } from "@saffron/shared";
import en from "@/messages/en.json";

export interface Doc {
  id: string;
  text: string;
  /** Set on dish notes, so answers can show dish cards. */
  slug?: string;
}

const DIET: Record<MenuItem["diet"], string> = {
  veg: "vegetarian (no egg)",
  vegan: "vegan",
  egg: "contains egg",
  nonVeg: "non-vegetarian",
};
const SPICE = ["not spicy", "mild", "medium spicy", "hot"];
const price = (paise: number) => formatPrice(paise, "en");
const allergen = (key: string) => (en.allergens as Record<string, string>)[key] ?? key;

function dishDoc(item: MenuItem): Doc {
  const category = demoCategories.find((c) => c.slug === item.category)!.name.en;
  const served = item.availableIn.includes("allDay") ? "all day" : item.availableIn.join(" and ");
  // Names in every language help when the guest writes in Hindi, Bengali, Marathi or Telugu.
  const names = [...new Set(LOCALES.map((l) => item.name[l]).filter(Boolean))].join(" / ");
  return {
    id: `dish:${item.slug}`,
    slug: item.slug,
    text: [
      `Dish: ${names}.`,
      item.description.en,
      `Cuisine: ${en.cuisines[item.cuisine]}. Menu section: ${category}, served ${served}.`,
      `Price: ${price(item.price)}.`,
      `Diet: ${DIET[item.diet]}. Spice: ${SPICE[item.spiceLevel]}.`,
      `Allergens: ${item.allergens.length ? item.allergens.map(allergen).join(", ") : "none listed"}.`,
      item.variants.length ? `Sizes: ${item.variants.map((v) => `${v.name.en} (+${price(v.priceDelta)})`).join(", ")}.` : "",
      item.addOns.length ? `Add-ons: ${item.addOns.map((a) => `${a.name.en} ${price(a.price)}`).join(", ")}.` : "",
      item.tags.includes("bestseller") ? "A bestseller." : "",
      item.tags.includes("chefSpecial") ? "Chef's special." : "",
      item.isAvailable ? "" : "Sold out today.",
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function infoDocs(): Doc[] {
  const meals = s.mealPeriods.map((p) => `${en.periods[p.key]} ${p.start}–${p.end}`).join(", ");
  const zones = s.delivery.zones
    .map((z) => `${z.name}: pincodes ${z.pincodes.join(", ")}, fee ${price(z.fee)}, minimum order ${price(z.minOrder)}, about ${z.etaMinutes} minutes`)
    .join("; ");
  const r = s.reservation;
  return [
    {
      id: "info:hours",
      text: `Opening hours: open every day ${s.openingHours.start}–${s.openingHours.end} (India time). Meal times: ${meals}. Tea, coffee and desserts are served all day while open. Each dish is only served in its own meal time.`,
    },
    {
      id: "info:contact",
      text: `Saffron & Steam café. Address: ${s.address.en}. Phone: ${s.phone}. Email: ${s.email}. WhatsApp: +${s.whatsapp}. The contact page has a form.`,
    },
    {
      id: "info:delivery",
      text: `Home delivery by the café's own riders. Delivery zones: ${zones}. Free delivery above ${price(s.delivery.freeDeliveryAbove)}. Cash on delivery for orders up to ${price(s.delivery.codMaxOrder)}. Other pincodes: pickup is available. Check a pincode on the home page.`,
    },
    {
      id: "info:booking",
      text: `Table booking on the Book a table page: pick a date up to ${r.bookingWindowDays} days ahead, a meal, a ${r.slotMinutes}-minute time slot and party size up to ${r.maxPartySize} people (bigger groups: call or WhatsApp). You can pre-order dishes and pay online or at the café.`,
    },
    {
      id: "info:ordering",
      text: `Order online for pickup (ready in about ${s.pickupLeadMinutes} minutes), dine-in (give your table number) or home delivery. Pay online, at the counter, or cash on delivery. Menu prices are before tax; ${s.taxPercent}% tax is added at checkout. Track your order on the order page.`,
    },
    {
      id: "info:menu",
      text: `The menu has ${demoMenu.length} dishes from Indian, Italian, American, Japanese and French kitchens, in sections: ${demoCategories.map((c) => c.name.en).join(", ")}. Indian food marks: green dot vegetarian, red triangle non-vegetarian, amber egg. The gallery page has photos of every dish and of the café.`,
    },
    ...(s.offersBanner.active ? [{ id: "info:offers", text: `Current offer: ${s.offersBanner.text.en}` }] : []),
    {
      id: "info:photos",
      text: `Café photos in the gallery: ${Object.values(en.gallery.photos).join(", ")}. The café has a coffee bar, a tandoor and a wood-fired pizza oven.`,
    },
  ];
}

export function buildDocs(): Doc[] {
  return [...demoMenu.map(dishDoc), ...infoDocs()];
}
