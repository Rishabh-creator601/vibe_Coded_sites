"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { LOCALES, type Locale } from "@saffron/shared";
import { Link, usePathname } from "@/i18n/navigation";

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  bn: "বাংলা",
  mr: "मराठी",
  te: "తెలుగు",
};

/** Lists the five languages; choosing one keeps you on the same page. */
export function LanguageLinks({ className = "", onPick }: { className?: string; onPick?: () => void }) {
  const pathname = usePathname();
  const current = useLocale();
  return (
    <ul className={className}>
      {LOCALES.map((l) => (
        <li key={l}>
          <Link
            href={pathname}
            locale={l}
            lang={l}
            hrefLang={l}
            onClick={onPick}
            aria-current={l === current ? "true" : undefined}
            className="flex min-h-11 items-center rounded-lg px-3 hover:bg-cream aria-[current]:font-semibold aria-[current]:text-kulhad"
          >
            {LANGUAGE_NAMES[l]}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  return (
    <details className="group relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-full px-3 font-medium hover:bg-paper [&::-webkit-details-marker]:hidden">
        <Languages className="size-[18px]" aria-hidden="true" />
        <span className="sr-only">{t("language")}: </span>
        <span lang={locale}>{LANGUAGE_NAMES[locale]}</span>
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-44 rounded-2xl border border-line bg-paper p-1.5 shadow-[0_12px_32px_-12px_rgb(42_26_18/0.35)]">
        <LanguageLinks />
      </div>
    </details>
  );
}
