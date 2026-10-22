import { quoteDelivery } from "./format";
import { toMinutes, type ZonedNow } from "./time";
import type { CafeSettings, MealPeriodKey, MenuItem } from "./types";

export interface LineInput {
  slug: string;
  qty: number;
  variant?: number;
  addOns?: number[];
}

export interface PricedLine extends LineInput {
  item: MenuItem;
  /** Paise. */
  unitPrice: number;
  /** Paise. */
  lineTotal: number;
}

/** PLAN.md 9.2: unit price = base + variant + add-ons. Unknown dishes are dropped. */
export function priceLines(lines: LineInput[], menu: MenuItem[]): PricedLine[] {
  const bySlug = new Map(menu.map((i) => [i.slug, i]));
  return lines.flatMap((line) => {
    const item = bySlug.get(line.slug);
    if (!item || line.qty <= 0) return [];
    const variant = line.variant !== undefined ? (item.variants[line.variant]?.priceDelta ?? 0) : 0;
    const addOns = (line.addOns ?? []).reduce((sum, i) => sum + (item.addOns[i]?.price ?? 0), 0);
    const unitPrice = item.price + variant + addOns;
    return [{ ...line, item, unitPrice, lineTotal: unitPrice * line.qty }];
  });
}

export type OrderType = "pickup" | "dineIn" | "delivery";
export type PaymentMethod = "online" | "counter" | "cod";

export interface Totals {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

/** Subtotal → delivery fee (free above the threshold) → tax → total, all in paise. */
export function computeTotals(subtotal: number, settings: CafeSettings, delivery?: { pincode: string }): Totals {
  let deliveryFee = 0;
  if (delivery) {
    const quote = quoteDelivery(delivery.pincode, settings);
    if (quote.ok && subtotal < quote.freeAbove) deliveryFee = quote.fee;
  }
  const tax = Math.round(((subtotal + deliveryFee) * settings.taxPercent) / 100);
  return { subtotal, deliveryFee, tax, total: subtotal + deliveryFee + tax };
}

/**
 * Table slots for one meal on one day, in `slotMinutes` steps. The last seating is an
 * hour before the meal ends; on today's date, slots less than 30 minutes away are hidden.
 */
export function reservationSlots(settings: CafeSettings, period: MealPeriodKey, isoDate: string, now?: ZonedNow): number[] {
  const meal = settings.mealPeriods.find((p) => p.key === period);
  if (!meal || settings.closures.some((c) => c.date === isoDate)) return [];
  const weekday = new Date(`${isoDate}T12:00:00Z`).getUTCDay();
  if (!meal.days.includes(weekday)) return [];
  const slots: number[] = [];
  for (let m = toMinutes(meal.start); m <= toMinutes(meal.end) - 60; m += settings.reservation.slotMinutes) {
    if (now && now.isoDate === isoDate && m < now.minutes + 30) continue;
    slots.push(m);
  }
  return slots;
}

/** Human-friendly reference like "SS-1021-4821" (prefix, month-day, random digits). */
export function makeReference(prefix: string, isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${month}${day}-${random}`;
}

/** Adds days to a "YYYY-MM-DD" date. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
