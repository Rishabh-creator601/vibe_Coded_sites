"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatClock, getCafeStatus, toMinutes, type CafeSettings, type Locale, type MealPeriodKey } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { KulhadMark } from "@/components/logo";
import { useCafeNow } from "@/lib/use-cafe-now";

// The ribbon shows 6 am to midnight.
const DAY_START = 6 * 60;
const DAY_END = 24 * 60;
const pct = (m: number) => ((m - DAY_START) / (DAY_END - DAY_START)) * 100;
const TICKS = [6, 9, 12, 15, 18, 21, 24].map((h) => h * 60);

// Morning light, noon, evening clay.
const SEGMENT_STYLE: Record<MealPeriodKey, string> = {
  breakfast: "bg-saffron-soft text-roast",
  lunch: "bg-saffron text-roast",
  dinner: "bg-kulhad text-white",
};

/** Today's meal periods on one line, with a marker at the current time. */
export function DayRibbon({ settings }: { settings: CafeSettings }) {
  const t = useTranslations("ribbon");
  const tp = useTranslations("periods");
  const locale = useLocale() as Locale;
  const now = useCafeNow(settings.timezone);
  const status = now ? getCafeStatus(settings, now) : null;
  const clock = (m: number) => formatClock(m, locale);

  const today = now?.weekday;
  const periods = settings.mealPeriods.filter((p) => today === undefined || p.days.includes(today));
  const teaStart = toMinutes(settings.openingHours.start);
  const teaEnd = toMinutes(settings.openingHours.end);
  const showMarker = now && now.minutes >= DAY_START && now.minutes <= DAY_END;
  const markerPct = now ? pct(now.minutes) : 0;
  const labelShift = markerPct < 12 ? "translate-x-0" : markerPct > 88 ? "-translate-x-full" : "-translate-x-1/2";

  return (
    <section aria-labelledby="ribbon-title" className="mt-12 rounded-photo border border-line bg-paper px-4 pt-5 pb-4 sm:px-7 sm:pt-6">
      <h2 id="ribbon-title" className="font-sans text-base font-semibold">
        {t("label")}
      </h2>

      <div className="relative mt-4 pt-10">
        {showMarker && (
          <div className="pointer-events-none absolute top-0 bottom-7 z-10" style={{ left: `${markerPct}%` }}>
            <span
              className={`absolute top-0 flex items-center gap-1 rounded-full bg-roast py-0.5 pr-2.5 pl-1.5 text-xs font-semibold whitespace-nowrap text-cream ${labelShift}`}
            >
              <KulhadMark animated className="h-5 w-4 [&_g]:text-cream/80" />
              {t("now", { time: clock(now.minutes) })}
            </span>
            <span className="absolute top-7 bottom-0 left-0 w-0.5 -translate-x-1/2 rounded-full bg-roast" />
          </div>
        )}

        <ol className="relative h-16 sm:h-[4.5rem]">
          {periods.map((p) => {
            const start = toMinutes(p.start);
            const end = toMinutes(p.end);
            const isCurrent = status?.kind === "meal" && status.period === p.key;
            const isPast = now ? now.minutes >= end : false;
            return (
              <li key={p.key} className="absolute inset-y-0" style={{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }}>
                <Link
                  href={{ pathname: "/menu", query: { period: p.key } }}
                  aria-label={t("seeMenu", { period: p.key, start: clock(start), end: clock(end) })}
                  aria-current={isCurrent ? "time" : undefined}
                  className={`flex h-full flex-col items-center justify-center rounded-xl px-1.5 text-center leading-tight transition-opacity duration-300 hover:brightness-95 ${SEGMENT_STYLE[p.key]} ${
                    isPast ? "opacity-45" : ""
                  } ${isCurrent ? "ring-2 ring-roast ring-offset-2 ring-offset-paper" : ""}`}
                >
                  <span className="text-[0.8rem] font-semibold sm:text-base">{tp(p.key)}</span>
                  <span className="hidden text-sm opacity-85 sm:block">{t("range", { start: clock(start), end: clock(end) })}</span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="relative mt-3 h-7" aria-label={t("allDay", { start: clock(teaStart), end: clock(teaEnd) })} role="img">
          <span
            className="absolute top-1 h-1 rounded-full bg-roast-soft/70"
            style={{ left: `${pct(teaStart)}%`, width: `${pct(teaEnd) - pct(teaStart)}%` }}
          />
          <span className="absolute top-2.5 text-xs text-roast-soft sm:text-sm" style={{ left: `${pct(teaStart)}%` }} aria-hidden="true">
            {t("allDay", { start: clock(teaStart), end: clock(teaEnd) })}
          </span>
        </div>

        <div className="relative mt-2 h-5 border-t border-line text-xs text-roast-soft tabular-nums" aria-hidden="true">
          {TICKS.map((m, i) => (
            <span
              key={m}
              className={`absolute top-1 whitespace-nowrap ${i === 0 ? "" : i === TICKS.length - 1 ? "-translate-x-full" : "-translate-x-1/2"} ${
                i % 2 === 1 ? "hidden sm:inline" : ""
              }`}
              style={{ left: `${pct(m)}%` }}
            >
              {clock(m % (24 * 60))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
