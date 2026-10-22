import { priceLines, type LineInput, type MenuItem, type PricedLine } from "@saffron/shared";
import { HttpError } from "../lib/http-error";

/**
 * Prices cart lines from the menu in the database (PLAN.md 9.2). Unknown or sold-out
 * dishes and options that don't exist are rejected rather than dropped, so the
 * customer never pays for something other than what they saw.
 */
export function priceOrReject(lines: LineInput[], menu: MenuItem[]): PricedLine[] {
  const bySlug = new Map(menu.map((i) => [i.slug, i]));
  for (const line of lines) {
    const item = bySlug.get(line.slug);
    if (!item || !item.isAvailable) {
      throw new HttpError(409, "ITEM_UNAVAILABLE", `${line.slug} can't be ordered right now`, { slug: line.slug });
    }
    const badVariant = line.variant !== undefined && !item.variants[line.variant];
    const addOns = line.addOns ?? [];
    const badAddOn = addOns.some((i) => !item.addOns[i]) || new Set(addOns).size !== addOns.length;
    if (badVariant || badAddOn) throw new HttpError(400, "VALIDATION_FAILED", `Unknown option for ${line.slug}`, { slug: line.slug });
  }
  return priceLines(lines, menu);
}

/** What an order or pre-order line stores: the choice plus the name and price at that moment. */
export function snapshot(lines: PricedLine[]) {
  return lines.map((l) => ({
    slug: l.slug,
    name: l.item.name,
    qty: l.qty,
    variant: l.variant,
    addOns: l.addOns?.length ? l.addOns : undefined,
    unitPrice: l.unitPrice,
    lineTotal: l.lineTotal,
  }));
}
