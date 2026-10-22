import type { Availability, CafeSettings, MealPeriodKey, MenuItem } from "./types";

/** "07:30" → 450 */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export interface ZonedNow {
  /** Minutes since local midnight in the café's time zone. */
  minutes: number;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  /** "2026-10-21" in the café's time zone. */
  isoDate: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Reads the wall clock in the café's time zone, whatever the visitor's zone is. */
export function getZonedNow(timezone: string, date: Date = new Date()): ZonedNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    weekday: WEEKDAYS.indexOf(get("weekday")),
    isoDate: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

export type CafeStatus =
  /** Serving a meal right now. */
  | { kind: "meal"; period: MealPeriodKey; endsAt: number }
  /** Open for tea, coffee and desserts; the next meal starts later today. */
  | { kind: "between"; next: { period: MealPeriodKey; startsAt: number } | null; closesAt: number }
  /** Closed now; opens again later today or tomorrow. */
  | { kind: "closed"; opensAt: number; tomorrow: boolean; closure?: boolean };

export function getCafeStatus(settings: CafeSettings, now: ZonedNow): CafeStatus {
  const open = toMinutes(settings.openingHours.start);
  const close = toMinutes(settings.openingHours.end);
  const closedToday = settings.closures.some((c) => c.date === now.isoDate);

  if (closedToday) return { kind: "closed", opensAt: open, tomorrow: true, closure: true };
  if (now.minutes < open) return { kind: "closed", opensAt: open, tomorrow: false };
  if (now.minutes >= close) return { kind: "closed", opensAt: open, tomorrow: true };

  const todays = settings.mealPeriods
    .filter((p) => p.days.includes(now.weekday))
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  const current = todays.find((p) => now.minutes >= toMinutes(p.start) && now.minutes < toMinutes(p.end));
  if (current) return { kind: "meal", period: current.key, endsAt: toMinutes(current.end) };

  const upcoming = todays.find((p) => toMinutes(p.start) > now.minutes);
  return {
    kind: "between",
    next: upcoming ? { period: upcoming.key, startsAt: toMinutes(upcoming.start) } : null,
    closesAt: close,
  };
}

export type ItemAvailability =
  | { orderable: true }
  | { orderable: false; reason: "soldOut" | "closed" }
  | { orderable: false; reason: "laterToday" | "tomorrow"; from: number }
  | { orderable: false; reason: "notToday" };

/** PLAN.md 9.1: sold-out items, closed hours and other meal periods can't be ordered now. */
export function getItemAvailability(
  item: Pick<MenuItem, "availableIn" | "isAvailable">,
  settings: CafeSettings,
  now: ZonedNow,
): ItemAvailability {
  if (!item.isAvailable) return { orderable: false, reason: "soldOut" };
  const status = getCafeStatus(settings, now);
  if (status.kind === "closed") return { orderable: false, reason: "closed" };
  if (item.availableIn.includes("allDay")) return { orderable: true };
  if (status.kind === "meal" && item.availableIn.includes(status.period)) return { orderable: true };

  const startsOn = (weekday: number) =>
    settings.mealPeriods
      .filter((p) => p.days.includes(weekday) && item.availableIn.includes(p.key as Availability))
      .map((p) => toMinutes(p.start))
      .sort((a, b) => a - b);

  const laterToday = startsOn(now.weekday).find((start) => start > now.minutes);
  if (laterToday !== undefined) return { orderable: false, reason: "laterToday", from: laterToday };
  const tomorrow = startsOn((now.weekday + 1) % 7)[0];
  if (tomorrow !== undefined) return { orderable: false, reason: "tomorrow", from: tomorrow };
  return { orderable: false, reason: "notToday" };
}
