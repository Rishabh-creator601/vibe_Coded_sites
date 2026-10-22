"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageLinks } from "./language-switcher";
import { NAV_LINKS } from "./nav-links";

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? t("closeNav") : t("openNav")}
        onClick={() => setOpen((o) => !o)}
        className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-paper"
      >
        {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
      </button>
      {open && (
        <nav
          id="mobile-nav"
          aria-label={t("menu")}
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="absolute inset-x-0 top-full border-y border-line bg-paper shadow-[0_24px_40px_-24px_rgb(42_26_18/0.4)]"
        >
          <div className="container-page grid gap-6 py-5 sm:grid-cols-2">
            <ul className="text-lg">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={close} className="flex min-h-12 items-center rounded-lg px-3 hover:bg-cream">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <p className="px-3 pb-1 text-sm text-roast-soft">{t("language")}</p>
              <LanguageLinks onPick={close} />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
