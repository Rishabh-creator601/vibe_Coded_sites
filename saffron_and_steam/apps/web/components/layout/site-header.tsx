import { getLocale, getTranslations } from "next-intl/server";
import { demoSettings, pick, type Locale } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { CartButton } from "@/components/cart/cart-button";
import { Wordmark } from "@/components/logo";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";
import { NAV_LINKS } from "./nav-links";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const locale = (await getLocale()) as Locale;
  const banner = demoSettings.offersBanner;
  return (
    <>
      {banner.active && (
        <p className="bg-saffron px-4 py-2 text-center text-sm font-medium text-roast">{pick(banner.text, locale)}</p>
      )}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/90 backdrop-blur-md">
        <div className="container-page relative flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <Link href="/" aria-label={t("home")} className="rounded-lg">
            <Wordmark />
          </Link>
          <nav aria-label={t("menu")} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex min-h-11 items-center rounded-full px-3.5 font-medium hover:bg-paper">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-1">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            <CartButton />
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  );
}
