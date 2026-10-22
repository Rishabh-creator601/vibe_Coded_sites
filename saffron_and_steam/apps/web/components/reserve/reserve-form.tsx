"use client";

import Image from "next/image";
import { useId, useMemo, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  addDays,
  CUISINES,
  demoMenu,
  formatClock,
  formatDate,
  formatNumber,
  formatPrice,
  pick,
  priceLines,
  reservationSlots,
  type CafeSettings,
  type Cuisine,
  type Locale,
  type MealPeriodKey,
  type MenuItem,
  type ZonedNow,
} from "@saffron/shared";
import { useRouter } from "@/i18n/navigation";
import { DietMark } from "@/components/diet-mark";
import { Chip, describedBy, Field, inputClass } from "@/components/ui/form";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { useCafeNow } from "@/lib/use-cafe-now";
import { useStoresHydrated } from "@/lib/use-hydrated";
import { isEmail, normalisePhone } from "@/lib/validate";
import { useRecords, type BookingDraft, type DietPreference } from "@/store/records";

const PERIODS: MealPeriodKey[] = ["breakfast", "lunch", "dinner"];
type ErrorKey = "time" | "name" | "phone" | "email";

function matchesFood(item: MenuItem, cuisines: Cuisine[], diet: DietPreference) {
  if (cuisines.length > 0 && !cuisines.includes(item.cuisine)) return false;
  if (diet === "veg" && item.diet !== "veg" && item.diet !== "vegan") return false;
  if (diet === "vegan" && item.diet !== "vegan") return false;
  return true;
}

function Step({ n, title, extra, children }: { n: number; title: string; extra?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <h2 id={`step-${n}`} className="flex items-baseline gap-3 text-2xl sm:text-3xl">
        <span className="flex size-9 shrink-0 translate-y-[-2px] items-center justify-center rounded-full bg-roast font-sans text-base font-semibold text-cream">{n}</span>
        <span>
          {title}
          {extra && <span className="ml-2 font-sans text-base font-normal text-roast-soft">({extra})</span>}
        </span>
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Waits until the café clock and any saved draft are available, then shows the form. */
export function ReserveForm({ settings }: { settings: CafeSettings }) {
  const hydrated = useStoresHydrated();
  const now = useCafeNow(settings.timezone);
  if (!hydrated || !now)
    return (
      <div className="flex justify-center py-24" role="status">
        <LoaderCircle className="size-8 animate-spin text-kulhad" aria-hidden="true" />
      </div>
    );
  return <ReserveFormBody settings={settings} startNow={now} draft={useRecords.getState().draft} />;
}

function ReserveFormBody({ settings, startNow, draft }: { settings: CafeSettings; startNow: ZonedNow; draft: BookingDraft | null }) {
  const t = useTranslations("reserveForm");
  const tf = useTranslations("form");
  const tp = useTranslations("periods");
  const tc = useTranslations("cuisines");
  const tfe = useTranslations("featured");
  const tcart = useTranslations("cart");
  const tm = useTranslations("menuPage");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const now = useCafeNow(settings.timezone) ?? startNow;
  const setDraft = useRecords((s) => s.setDraft);

  // Start from the saved draft (coming back from the review page), or from the
  // first meal today that still has free tables.
  const [initial] = useState(() => {
    const todayOpen = PERIODS.find((p) => reservationSlots(settings, p, startNow.isoDate, startNow).length > 0);
    return {
      date: draft?.date ?? (todayOpen ? startNow.isoDate : addDays(startNow.isoDate, 1)),
      period: draft?.period ?? todayOpen ?? ("breakfast" as MealPeriodKey),
    };
  });
  const [date, setDate] = useState(initial.date);
  const [period, setPeriod] = useState<MealPeriodKey>(initial.period);
  const [time, setTime] = useState<number | null>(draft?.time ?? null);
  const [party, setParty] = useState(draft?.party ?? 2);
  const [cuisines, setCuisines] = useState<Cuisine[]>(draft?.cuisines ?? []);
  const [diet, setDiet] = useState<DietPreference>(draft?.diet ?? "any");
  const [preorder, setPreorder] = useState<Record<string, number>>(() => Object.fromEntries((draft?.preorder ?? []).map((l) => [l.slug, l.qty])));
  const [customer, setCustomer] = useState(draft?.customer ?? { name: "", phone: "", email: "" });
  const [notes, setNotes] = useState(draft?.notes ?? "");
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});

  const today = now.isoDate;
  const lastDay = today ? addDays(today, settings.reservation.bookingWindowDays) : "";
  const slots = date ? reservationSlots(settings, period, date, now) : [];
  const periodsWithSlots = PERIODS.filter((p) => (date ? reservationSlots(settings, p, date, now).length > 0 : true));

  const { mains, extras } = useMemo(() => {
    const fits = (i: MenuItem) => matchesFood(i, cuisines, diet) && i.isAvailable;
    return {
      mains: demoMenu.filter((i) => i.category === period && fits(i)),
      extras: demoMenu.filter((i) => (i.category === "tea-coffee" || i.category === "desserts") && fits(i)),
    };
  }, [period, cuisines, diet]);

  const lines = Object.entries(preorder)
    .filter(([, qty]) => qty > 0)
    .map(([slug, qty]) => ({ slug, qty }));
  const priced = priceLines(lines, demoMenu);
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const preorderCount = priced.reduce((s, l) => s + l.qty, 0);

  const toggleCuisine = (c: Cuisine) => setCuisines((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const choosePeriod = (p: MealPeriodKey) => {
    setPeriod(p);
    setTime(null);
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phone = normalisePhone(customer.phone);
    const next: Partial<Record<ErrorKey, string>> = {};
    if (time === null || !slots.includes(time)) next.time = t("pickTime");
    if (!customer.name.trim()) next.name = tf("nameRequired");
    if (!phone) next.phone = tf("phoneInvalid");
    if (!isEmail(customer.email)) next.email = tf("emailInvalid");
    setErrors(next);
    const first = (["time", "name", "phone", "email"] as const).find((k) => next[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    setDraft({
      date,
      period,
      time: time!,
      party,
      cuisines,
      diet,
      // Keep only pre-ordered dishes that still match the chosen meal.
      preorder: lines.filter((l) => [...mains, ...extras].some((i) => i.slug === l.slug)),
      customer: { name: customer.name.trim(), phone: phone!, email: customer.email.trim() },
      notes: notes.trim(),
    });
    router.push("/reserve/review");
  }

  const f = (name: string) => `${id}-${name}`;

  const dishRow = (item: MenuItem) => {
    const name = pick(item.name, locale);
    return (
      <li key={item.slug} className="flex items-center gap-3 border-b border-line py-3 last:border-0 sm:gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-line">
          <Image src={item.images[0].url} alt="" fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-start gap-2 leading-snug font-medium">
            <span className="mt-1">
              <DietMark diet={item.diet} label={tfe(`diet.${item.diet}`)} size={14} />
            </span>
            {name}
          </p>
          <p className="text-sm text-roast-soft">
            {tc(item.cuisine)}, <span className="tabular-nums">{formatPrice(item.price, locale)}</span>
          </p>
        </div>
        <QtyStepper
          value={preorder[item.slug] ?? 0}
          onChange={(v) => setPreorder((p) => ({ ...p, [item.slug]: v }))}
          max={10}
          label={name}
          decLabel={tcart("decrease", { name })}
          incLabel={tcart("increase", { name })}
          format={(n) => formatNumber(n, locale)}
        />
      </li>
    );
  };

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      <div>
        <Step n={1} title={t("when")}>
          <div className="grid gap-5 sm:grid-cols-[minmax(0,16rem)_1fr]">
            <Field id={f("date")} label={t("date")}>
              <input
                id={f("date")}
                type="date"
                value={date}
                min={today}
                max={lastDay}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime(null);
                }}
                className={`${inputClass} cursor-pointer`}
              />
            </Field>
            <fieldset>
              <legend className="font-semibold">{t("meal")}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PERIODS.map((p) => (
                  <Chip key={p} type="radio" name={f("period")} checked={period === p} onChange={() => choosePeriod(p)} disabled={!periodsWithSlots.includes(p)}>
                    {tp(p)}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>
          <fieldset className="mt-6" aria-describedby={errors.time ? f("time-error") : undefined}>
            <legend className="font-semibold">
              {t("time")}
              {date && <span className="ml-2 font-normal text-roast-soft">{formatDate(date, locale)}</span>}
            </legend>
            {slots.length === 0 ? (
              <p className="mt-2 text-roast-soft">{t("noSlots")}</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2" data-field="time" tabIndex={-1}>
                {slots.map((m) => (
                  <Chip key={m} type="radio" name={f("time")} checked={time === m} onChange={() => setTime(m)}>
                    <span className="tabular-nums">{formatClock(m, locale, { minutes: true })}</span>
                  </Chip>
                ))}
              </div>
            )}
            {errors.time && (
              <p id={f("time-error")} className="mt-2 text-sm font-medium text-chili">
                {errors.time}
              </p>
            )}
          </fieldset>
        </Step>

        <Step n={2} title={t("who")}>
          <p className="font-semibold">{t("party")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <QtyStepper
              value={party}
              onChange={setParty}
              min={1}
              max={settings.reservation.maxPartySize}
              label={t("party")}
              decLabel={t("fewer")}
              incLabel={t("more")}
              format={(n) => formatNumber(n, locale)}
            />
            <span className="text-roast-soft">{t("people", { count: party })}</span>
          </div>
          <p className="mt-2 text-sm text-roast-soft">{t("partyHint", { max: formatNumber(settings.reservation.maxPartySize, locale) })}</p>
        </Step>

        <Step n={3} title={t("food")}>
          <fieldset>
            <legend className="font-semibold">{t("foodType")}</legend>
            <p className="text-sm text-roast-soft">{t("foodHint")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip type="checkbox" name={f("cuisine-any")} checked={cuisines.length === 0} onChange={() => setCuisines([])}>
                {t("anything")}
              </Chip>
              {CUISINES.map((c) => (
                <Chip key={c} type="checkbox" name={f("cuisine")} checked={cuisines.includes(c)} onChange={() => toggleCuisine(c)}>
                  {tc(c)}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="font-semibold">{t("dietPref")}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["any", "veg", "vegan"] as const).map((d) => (
                <Chip key={d} type="radio" name={f("diet")} checked={diet === d} onChange={() => setDiet(d)}>
                  {d !== "any" && <DietMark diet={d} label="" size={14} />}
                  {d === "any" ? t("dietAny") : d === "veg" ? t("dietVeg") : t("dietVegan")}
                </Chip>
              ))}
            </div>
          </fieldset>
        </Step>

        <Step n={4} title={t("preorder")} extra={t("optional")}>
          <p className="max-w-2xl text-roast-soft">{t("preorderIntro")}</p>
          {mains.length + extras.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line px-5 py-6 text-center">{t("preorderEmpty")}</p>
          ) : (
            <div className="mt-4 grid gap-4">
              {mains.length > 0 && (
                <div className="rounded-2xl border border-line bg-paper px-4 pt-3">
                  <h3 className="pt-1 font-sans text-sm font-semibold text-roast-soft">{t("mains", { meal: tp(period) })}</h3>
                  <ul>{mains.map(dishRow)}</ul>
                </div>
              )}
              {extras.length > 0 && (
                <div className="rounded-2xl border border-line bg-paper px-4 pt-3">
                  <h3 className="pt-1 font-sans text-sm font-semibold text-roast-soft">{t("extras")}</h3>
                  <ul>{extras.map(dishRow)}</ul>
                </div>
              )}
            </div>
          )}
        </Step>

        <Step n={5} title={t("details")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={f("name")} label={tf("name")} error={errors.name}>
              <input
                id={f("name")}
                data-field="name"
                autoComplete="name"
                value={customer.name}
                onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                className={inputClass}
                aria-invalid={!!errors.name}
                aria-describedby={describedBy(f("name"), null, errors.name)}
              />
            </Field>
            <Field id={f("phone")} label={tf("phone")} error={errors.phone}>
              <input
                id={f("phone")}
                data-field="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={customer.phone}
                onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                className={inputClass}
                aria-invalid={!!errors.phone}
                aria-describedby={describedBy(f("phone"), null, errors.phone)}
              />
            </Field>
            <Field id={f("email")} label={tf("email")} error={errors.email} className="sm:col-span-2">
              <input
                id={f("email")}
                data-field="email"
                type="email"
                autoComplete="email"
                value={customer.email}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                className={inputClass}
                aria-invalid={!!errors.email}
                aria-describedby={describedBy(f("email"), null, errors.email)}
              />
            </Field>
            <Field id={f("notes")} label={t("notes")} className="sm:col-span-2">
              <textarea
                id={f("notes")}
                rows={3}
                maxLength={500}
                value={notes}
                placeholder={t("notesPlaceholder")}
                onChange={(e) => setNotes(e.target.value)}
                className={`${inputClass} py-3`}
              />
            </Field>
          </div>
        </Step>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-roast p-6 text-cream">
          <dl className="grid gap-3">
            <div>
              <dt className="text-sm text-cream/65">{t("when")}</dt>
              <dd className="text-lg">
                {date ? formatDate(date, locale) : "…"}
                {time !== null && <span className="tabular-nums">, {formatClock(time, locale, { minutes: true })}</span>}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-cream/65">{t("who")}</dt>
              <dd className="text-lg">{t("people", { count: party })}</dd>
            </div>
            <div>
              <dt className="text-sm text-cream/65">{t("preorder")}</dt>
              <dd className="text-lg">
                {preorderCount > 0 ? (
                  <span className="tabular-nums">
                    {tm("results", { count: preorderCount })}, {formatPrice(subtotal, locale)}
                  </span>
                ) : (
                  <span className="text-base text-cream/75">{t("noPreorder")}</span>
                )}
              </dd>
            </div>
          </dl>
          {Object.keys(errors).some((k) => errors[k as ErrorKey]) && (
            <p role="alert" className="mt-4 rounded-xl bg-cream/10 px-3 py-2 text-sm">
              {tf("fixErrors")}
            </p>
          )}
          <button type="submit" disabled={!date} className="btn mt-5 w-full cursor-pointer bg-saffron text-roast hover:bg-saffron-soft disabled:opacity-50">
            {t("continue")}
          </button>
        </div>
      </aside>
    </form>
  );
}
