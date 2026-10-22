import type { CafeSettings, Locale, Localized } from "./types";

/** Picks the text for a language, falling back to English when it's missing. */
export function pick(text: Localized, locale: Locale): string {
  return text[locale] || text.en;
}

/** BCP 47 tag used for Intl formatting, e.g. "hi-IN". */
export function intlLocale(locale: Locale): string {
  return `${locale}-IN`;
}

/** 24900 → "₹249" (or "₹249.50" when there are paise). */
export function formatPrice(paise: number, locale: Locale): string {
  const whole = paise % 100 === 0;
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(paise / 100);
}

/** 450 → "7:30 am" in the visitor's language. */
export function formatClock(minutes: number, locale: Locale, opts: { minutes?: boolean } = {}): string {
  const date = new Date(Date.UTC(2000, 0, 1, Math.floor(minutes / 60) % 24, minutes % 60));
  const showMinutes = opts.minutes ?? minutes % 60 !== 0;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: "numeric",
    minute: showMinutes ? "2-digit" : undefined,
    timeZone: "UTC",
  }).format(date);
}

/** "2026-10-24" → "Saturday, 24 October" in the visitor's language. */
export function formatDate(isoDate: string, locale: Locale, opts: { weekday?: boolean; year?: boolean } = {}): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: opts.weekday === false ? undefined : "long",
    day: "numeric",
    month: "long",
    year: opts.year ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(n);
}

export type DeliveryQuote =
  | { ok: true; zoneName: string; fee: number; minOrder: number; etaMinutes: number; freeAbove: number }
  | { ok: false; reason: "invalidPincode" | "notCovered" | "disabled" };

/**
 * Looks up the delivery zone for a pincode. The API's POST /delivery/quote uses the
 * same function, so the checker on the home page and checkout always agree.
 */
export function quoteDelivery(pincode: string, settings: CafeSettings): DeliveryQuote {
  if (!settings.delivery.enabled) return { ok: false, reason: "disabled" };
  const clean = pincode.trim();
  if (!/^[1-9]\d{5}$/.test(clean)) return { ok: false, reason: "invalidPincode" };
  const zone = settings.delivery.zones.find((z) => z.pincodes.includes(clean));
  if (!zone) return { ok: false, reason: "notCovered" };
  return {
    ok: true,
    zoneName: zone.name,
    fee: zone.fee,
    minOrder: zone.minOrder,
    etaMinutes: zone.etaMinutes,
    freeAbove: settings.delivery.freeDeliveryAbove,
  };
}
