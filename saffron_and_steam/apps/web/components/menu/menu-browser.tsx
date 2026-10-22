"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import {
  CUISINES,
  demoCategories,
  demoMenu,
  formatClock,
  formatPrice,
  pick,
  toMinutes,
  type CafeSettings,
  type CategorySlug,
  type Cuisine,
  type Locale,
  type MenuItem,
} from "@saffron/shared";
import { DietMark } from "@/components/diet-mark";
import { AddToCartButton } from "@/components/home/add-to-cart-button";
import { AvailabilityNote } from "@/components/home/availability-note";
import { Chip, inputClass } from "@/components/ui/form";
import { useQueryParam } from "@/lib/use-query-param";

type Tab = "all" | CategorySlug;
type DietFilter = "any" | "veg" | "vegan";

function DishCard({ item, settings }: { item: MenuItem; settings: CafeSettings }) {
  const t = useTranslations("featured");
  const tc = useTranslations("cuisines");
  const ta = useTranslations("allergens");
  const locale = useLocale() as Locale;
  const name = pick(item.name, locale);
  const special = item.tags.find((tag) => tag === "chefSpecial" || tag === "bestseller");

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-line bg-paper">
      <div className="relative aspect-[4/3] bg-line">
        <Image src={item.images[0].url} alt={pick(item.images[0].alt, locale)} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-x-2.5 text-sm text-roast-soft">
          <DietMark diet={item.diet} label={t(`diet.${item.diet}`)} />
          <span>{tc(item.cuisine)}</span>
          {special && <span className="font-semibold text-kulhad">{t(special)}</span>}
        </p>
        <h3 className="mt-2 text-[1.4rem] leading-snug">{name}</h3>
        <p className="mt-1.5 text-[0.97rem] text-roast-soft">{pick(item.description, locale)}</p>
        {item.allergens.length > 0 && (
          <p className="mt-2 text-sm text-roast-soft/90">{ta("label", { list: item.allergens.map((a) => ta(a)).join(", ") })}</p>
        )}
        <div className="mt-auto pt-4">
          <div className="text-sm">
            <AvailabilityNote item={item} settings={settings} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-lg font-semibold tabular-nums">{formatPrice(item.price, locale)}</span>
            <AddToCartButton slug={item.slug} name={name} disabled={!item.isAvailable} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function MenuBrowser({ settings }: { settings: CafeSettings }) {
  const t = useTranslations("menuPage");
  const tc = useTranslations("cuisines");
  const ts = useTranslations("ribbon");
  const locale = useLocale() as Locale;
  const id = useId();
  // The day ribbon on the home page links here with ?period=lunch. The URL is read in
  // the browser only, so the pre-rendered page always starts on "All".
  const urlPeriod = useQueryParam("period");
  const [picked, setTab] = useState<Tab | null>(null);
  const tab: Tab = picked ?? (demoCategories.some((c) => c.slug === urlPeriod) ? (urlPeriod as Tab) : "all");
  const [cuisine, setCuisine] = useState<Cuisine | "any">("any");
  const [diet, setDiet] = useState<DietFilter>("any");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoMenu.filter((i) => {
      if (tab !== "all" && i.category !== tab) return false;
      if (cuisine !== "any" && i.cuisine !== cuisine) return false;
      if (diet === "veg" && i.diet !== "veg" && i.diet !== "vegan") return false;
      if (diet === "vegan" && i.diet !== "vegan") return false;
      if (!q) return true;
      return [pick(i.name, locale), i.name.en, pick(i.description, locale)].some((s) => s.toLowerCase().includes(q));
    });
  }, [tab, cuisine, diet, query, locale]);

  const sections = demoCategories
    .map((c) => ({ category: c, items: filtered.filter((i) => i.category === c.slug) }))
    .filter((s) => s.items.length > 0);

  const servedWhen = (slug: CategorySlug) => {
    const period = settings.mealPeriods.find((p) => p.key === slug);
    const [start, end] = period ? [period.start, period.end] : [settings.openingHours.start, settings.openingHours.end];
    return ts("range", { start: formatClock(toMinutes(start), locale), end: formatClock(toMinutes(end), locale) });
  };
  const clear = () => {
    setCuisine("any");
    setDiet("any");
    setQuery("");
    setTab("all");
  };

  const tabs: { key: Tab; label: string }[] = [{ key: "all", label: t("all") }, ...demoCategories.map((c) => ({ key: c.slug, label: pick(c.name, locale) }))];

  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <h1 className="text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-roast-soft">{t("intro", { count: demoMenu.length })}</p>

      <div className="sticky top-16 z-20 -mx-4 mt-8 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-[4.5rem] lg:-mx-8 lg:px-8">
        <div role="group" aria-label={t("meal")} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {tabs.map((x) => (
            <button
              key={x.key}
              type="button"
              aria-pressed={tab === x.key}
              onClick={() => setTab(x.key)}
              className="min-h-11 shrink-0 cursor-pointer rounded-full px-4 font-semibold whitespace-nowrap transition-colors duration-150 hover:bg-paper aria-pressed:bg-kulhad aria-pressed:text-white"
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
        <div className="relative">
          <label htmlFor={`${id}-q`} className="sr-only">
            {t("search")}
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-roast-soft" aria-hidden="true" />
          <input id={`${id}-q`} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchPlaceholder")} className={`${inputClass} rounded-full pl-11`} />
        </div>
        <div className="flex flex-col gap-3">
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">{t("cuisine")}</legend>
            <Chip type="radio" name={`${id}-cuisine`} checked={cuisine === "any"} onChange={() => setCuisine("any")}>
              {t("anyCuisine")}
            </Chip>
            {CUISINES.map((c) => (
              <Chip key={c} type="radio" name={`${id}-cuisine`} checked={cuisine === c} onChange={() => setCuisine(c)}>
                {tc(c)}
              </Chip>
            ))}
          </fieldset>
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">{t("diet")}</legend>
            {(["any", "veg", "vegan"] as const).map((d) => (
              <Chip key={d} type="radio" name={`${id}-diet`} checked={diet === d} onChange={() => setDiet(d)}>
                {d !== "any" && <DietMark diet={d} label="" size={14} />}
                {d === "any" ? t("anyDiet") : d === "veg" ? t("vegOnly") : t("veganOnly")}
              </Chip>
            ))}
          </fieldset>
        </div>
      </div>

      <p role="status" className="mt-6 text-roast-soft">
        {t("results", { count: filtered.length })}
      </p>

      {sections.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line px-6 py-14 text-center">
          <p className="text-lg">{t("empty")}</p>
          <button type="button" onClick={clear} className="btn btn-outline mt-5 cursor-pointer">
            {t("clear")}
          </button>
        </div>
      ) : (
        sections.map(({ category, items }) => (
          <section key={category.slug} aria-labelledby={`cat-${category.slug}`} className="mt-10 scroll-mt-40">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line pb-3">
              <h2 id={`cat-${category.slug}`} className="text-3xl sm:text-4xl">
                {pick(category.name, locale)}
              </h2>
              <p className="text-roast-soft tabular-nums">{servedWhen(category.slug)}</p>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <DishCard key={item.slug} item={item} settings={settings} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
