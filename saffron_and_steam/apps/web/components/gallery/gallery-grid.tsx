"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Chip } from "@/components/ui/form";
import { useQueryParam } from "@/lib/use-query-param";

export type GalleryCategory = "breakfast" | "lunch" | "dinner" | "tea-coffee" | "desserts" | "cafe";

export interface GalleryPhoto {
  key: string;
  src: string;
  width: number;
  height: number;
  title: string;
  alt: string;
  category: GalleryCategory;
  credit: { author: string; license: string; href: string } | null;
}

export function GalleryGrid({ photos, categories }: { photos: GalleryPhoto[]; categories: { key: GalleryCategory; label: string }[] }) {
  const t = useTranslations("gallery");
  const id = useId();
  // The chatbot links here with ?cat=dinner. Read in the browser only, so the
  // pre-rendered page always starts on "All".
  const urlCat = useQueryParam("cat");
  const [picked, setFilter] = useState<GalleryCategory | "all" | null>(null);
  const filter = picked ?? (categories.some((c) => c.key === urlCat) ? (urlCat as GalleryCategory) : "all");
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = filter === "all" ? photos : photos.filter((p) => p.category === filter);
  const current = index !== null ? shown[index] : null;

  const step = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + shown.length) % shown.length)), [shown.length]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  return (
    <>
      <fieldset className="mt-8 flex flex-wrap gap-2">
        <legend className="sr-only">{t("filter")}</legend>
        <Chip type="radio" name={`${id}-cat`} checked={filter === "all"} onChange={() => setFilter("all")}>
          {t("all")}
        </Chip>
        {categories.map((c) => (
          <Chip key={c.key} type="radio" name={`${id}-cat`} checked={filter === c.key} onChange={() => setFilter(c.key)}>
            {c.label}
          </Chip>
        ))}
      </fieldset>

      <ul className="mt-8 columns-2 gap-3 sm:gap-4 md:columns-3 xl:columns-4">
        {shown.map((p, i) => (
          <li key={p.key} className="mb-3 break-inside-avoid sm:mb-4">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("open", { name: p.title })}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-line"
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={p.width}
                height={p.height}
                sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-roast/80 to-transparent px-3 pt-8 pb-2.5 text-left text-sm font-medium text-cream">
                {p.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={current?.title}
        onClose={() => setIndex(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => e.target === dialog.current && setIndex(null)}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-roast/95 p-0 text-cream backdrop:bg-transparent"
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="tabular-nums">{t("counter", { n: (index ?? 0) + 1, total: shown.length })}</p>
              <button type="button" onClick={() => setIndex(null)} aria-label={t("close")} className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream/10">
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1" onClick={() => setIndex(null)}>
              <Image key={current.key} src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain px-2 sm:px-20" />
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <button type="button" onClick={() => step(-1)} aria-label={t("prev")} className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-cream/10 hover:bg-cream/20">
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <div className="min-w-0 text-center">
                <p className="font-display text-xl">{current.title}</p>
                {current.credit && (
                  <a href={current.credit.href} target="_blank" rel="noopener noreferrer" className="text-sm text-cream/70 underline-offset-2 hover:underline">
                    {t("credit", { author: current.credit.author, license: current.credit.license })}
                  </a>
                )}
              </div>
              <button type="button" onClick={() => step(1)} aria-label={t("next")} className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-cream/10 hover:bg-cream/20">
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
