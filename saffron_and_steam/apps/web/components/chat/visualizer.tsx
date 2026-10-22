"use client";

import Image from "next/image";
import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight, Images, UtensilsCrossed } from "lucide-react";
import { demoMenu, formatPrice, pick, type Locale, type MealPeriodKey } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { DietMark } from "@/components/diet-mark";
import { AddToCartButton } from "@/components/home/add-to-cart-button";

/**
 * The chatbot's Visualizer: a swipeable row of the dishes picked for the guest, with
 * photos, names and prices straight from the menu data, then links to the full
 * gallery and menu.
 */
export function Visualizer({ picks, meal, onNavigate }: { picks: string[]; meal?: MealPeriodKey; onNavigate: () => void }) {
  const t = useTranslations("chat");
  const tf = useTranslations("featured");
  const locale = useLocale() as Locale;
  const track = useRef<HTMLUListElement>(null);
  const items = picks.flatMap((slug) => demoMenu.find((i) => i.slug === slug) ?? []);
  const scroll = (direction: 1 | -1) => track.current?.scrollBy({ left: direction * 188, behavior: "smooth" });

  return (
    <div className="mt-3">
      <div className="relative">
        <ul ref={track} aria-label={t("picksLabel")} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {items.map((item) => {
            const name = pick(item.name, locale);
            return (
              <li key={item.slug} className="flex w-44 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-white">
                <div className="relative aspect-[4/3] bg-line">
                  <Image src={item.images[0].url} alt={pick(item.images[0].alt, locale)} fill sizes="176px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="flex items-start gap-1.5 text-sm leading-snug font-semibold">
                    <span className="mt-0.5">
                      <DietMark diet={item.diet} label={tf(`diet.${item.diet}`)} size={13} />
                    </span>
                    {name}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="text-sm font-semibold tabular-nums">{formatPrice(item.price, locale)}</span>
                    <AddToCartButton slug={item.slug} name={name} disabled={!item.isAvailable} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label={t("prev")}
              className="absolute top-[4.1rem] left-1 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-roast/80 text-cream hover:bg-roast"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label={t("next")}
              className="absolute top-[4.1rem] right-1 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-roast/80 text-cream hover:bg-roast"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <div className="mt-2 grid gap-2">
        <Link href={meal ? `/gallery?cat=${meal}` : "/gallery"} onClick={onNavigate} className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white px-4 font-semibold hover:border-roast">
          <Images className="size-5 shrink-0 text-kulhad" aria-hidden="true" />
          <span className="flex-1">{t("browseGallery")}</span>
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
        <Link href={meal ? `/menu?period=${meal}` : "/menu"} onClick={onNavigate} className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white px-4 font-semibold hover:border-roast">
          <UtensilsCrossed className="size-5 shrink-0 text-kulhad" aria-hidden="true" />
          <span className="flex-1">{t("seeMenu")}</span>
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
