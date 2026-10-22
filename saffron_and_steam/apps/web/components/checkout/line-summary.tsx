"use client";

import { useLocale, useTranslations } from "next-intl";
import { demoMenu, formatNumber, formatPrice, pick, priceLines, type LineInput, type Locale, type Totals } from "@saffron/shared";
import { DietMark } from "@/components/diet-mark";

/** "2 × Masala chai ........ ₹98" rows for a cart, order or pre-order. */
export function LineSummary({ lines, dark = false }: { lines: LineInput[]; dark?: boolean }) {
  const tf = useTranslations("featured");
  const locale = useLocale() as Locale;
  return (
    <ul>
      {priceLines(lines, demoMenu).map((l) => (
        <li key={`${l.slug}-${l.variant ?? 0}-${(l.addOns ?? []).join(".")}`} className={`flex items-start gap-3 border-b py-2.5 last:border-0 ${dark ? "border-cream/15" : "border-line"}`}>
          <span className="mt-1">
            <DietMark diet={l.item.diet} label={tf(`diet.${l.item.diet}`)} size={14} />
          </span>
          <span className="min-w-0 flex-1 leading-snug">
            <span className="tabular-nums">{formatNumber(l.qty, locale)} ×</span> {pick(l.item.name, locale)}
            {l.variant !== undefined && l.item.variants[l.variant] && <span className={dark ? "text-cream/65" : "text-roast-soft"}>, {pick(l.item.variants[l.variant].name, locale)}</span>}
          </span>
          <span className="shrink-0 tabular-nums">{formatPrice(l.lineTotal, locale)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Subtotal, delivery fee, tax and total. */
export function TotalsSummary({ totals, taxPercent, showDelivery = false, dark = false }: { totals: Totals; taxPercent: number; showDelivery?: boolean; dark?: boolean }) {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const locale = useLocale() as Locale;
  const muted = dark ? "text-cream/70" : "text-roast-soft";
  return (
    <dl className="grid gap-1.5">
      <div className="flex justify-between gap-4">
        <dt className={muted}>{tc("subtotal")}</dt>
        <dd className="tabular-nums">{formatPrice(totals.subtotal, locale)}</dd>
      </div>
      {showDelivery && (
        <div className="flex justify-between gap-4">
          <dt className={muted}>{t("deliveryFee")}</dt>
          <dd className="tabular-nums">{totals.deliveryFee === 0 ? t("free") : formatPrice(totals.deliveryFee, locale)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className={muted}>{t("tax", { percent: formatNumber(taxPercent, locale) })}</dt>
        <dd className="tabular-nums">{formatPrice(totals.tax, locale)}</dd>
      </div>
      <div className={`mt-1 flex justify-between gap-4 border-t pt-2 text-lg font-semibold ${dark ? "border-cream/20" : "border-line"}`}>
        <dt>{t("total")}</dt>
        <dd className="tabular-nums">{formatPrice(totals.total, locale)}</dd>
      </div>
    </dl>
  );
}
