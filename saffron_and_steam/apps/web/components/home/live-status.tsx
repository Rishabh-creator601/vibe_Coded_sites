"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatClock, getCafeStatus, toMinutes, type CafeSettings, type Locale } from "@saffron/shared";
import { useCafeNow } from "@/lib/use-cafe-now";

/** "Open now: Lunch is on until 4 pm." Worked out in the browser, in the café's time zone. */
export function LiveStatus({ settings }: { settings: CafeSettings }) {
  const t = useTranslations("status");
  const locale = useLocale() as Locale;
  const now = useCafeNow(settings.timezone);
  const clock = (m: number) => formatClock(m, locale);

  let open: boolean | null = null;
  let text: string;
  if (!now) {
    text = t("hoursSummary", { open: clock(toMinutes(settings.openingHours.start)), close: clock(toMinutes(settings.openingHours.end)) });
  } else {
    const s = getCafeStatus(settings, now);
    open = s.kind !== "closed";
    if (s.kind === "meal") text = t("meal", { period: s.period, time: clock(s.endsAt) });
    else if (s.kind === "between")
      text = s.next ? t("between", { period: s.next.period, time: clock(s.next.startsAt) }) : t("betweenLast", { time: clock(s.closesAt) });
    else if (s.closure) text = t("closure", { time: clock(s.opensAt) });
    else text = t(s.tomorrow ? "opensTomorrow" : "opensToday", { time: clock(s.opensAt) });
  }

  return (
    <p role="status" className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-1">
      {open !== null && (
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
            open ? "bg-leaf/12 text-leaf" : "bg-chili/10 text-chili"
          }`}
        >
          <span className={`size-2 rounded-full ${open ? "bg-leaf" : "bg-chili"}`} aria-hidden="true" />
          {open ? t("open") : t("closed")}
        </span>
      )}
      <span className="text-roast-soft">{text}</span>
    </p>
  );
}
