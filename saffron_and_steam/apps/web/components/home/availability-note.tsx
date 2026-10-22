"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatClock, getItemAvailability, type CafeSettings, type Locale, type MenuItem } from "@saffron/shared";
import { useCafeNow } from "@/lib/use-cafe-now";

/** "Available now" or "From 12 pm", worked out in the browser for the café's time zone. */
export function AvailabilityNote({ item, settings }: { item: Pick<MenuItem, "availableIn" | "isAvailable">; settings: CafeSettings }) {
  const t = useTranslations("featured");
  const locale = useLocale() as Locale;
  const now = useCafeNow(settings.timezone);
  if (!now) return <span className="inline-block h-5" />;

  const a = getItemAvailability(item, settings, now);
  if (a.orderable)
    return (
      <span className="inline-flex items-center gap-1.5 text-leaf">
        <span className="size-1.5 rounded-full bg-leaf" aria-hidden="true" />
        {t("now")}
      </span>
    );
  const text =
    a.reason === "laterToday"
      ? t("from", { time: formatClock(a.from, locale) })
      : a.reason === "tomorrow"
        ? t("tomorrow", { time: formatClock(a.from, locale) })
        : a.reason === "soldOut" ? t("soldOut") : a.reason === "closed" ? t("whenOpen") : t("notToday");
  return <span className="text-roast-soft">{text}</span>;
}
