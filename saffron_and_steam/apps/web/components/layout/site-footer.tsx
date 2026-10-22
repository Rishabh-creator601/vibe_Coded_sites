import { getLocale, getTranslations } from "next-intl/server";
import { pick, type CafeSettings, type Locale } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { KulhadMark } from "@/components/logo";
import { LanguageLinks } from "./language-switcher";
import { NAV_LINKS } from "./nav-links";
import { NewsletterForm } from "./newsletter-form";

export async function SiteFooter({ settings }: { settings: CafeSettings }) {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const locale = (await getLocale()) as Locale;

  return (
    <footer className="bg-roast text-cream">
      <div className="container-page grid gap-12 border-t border-cream/10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_1.5fr] lg:gap-10">
        <div>
          <p className="flex items-center gap-2">
            <KulhadMark className="h-9 w-8 [&_g]:text-cream/70" />
            <span lang="en" className="font-display text-2xl">
              {settings.cafeName}
            </span>
          </p>
          <p className="mt-4 max-w-xs text-cream/75">{pick(settings.tagline, locale)}</p>
        </div>

        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className="font-sans text-sm font-normal text-cream/60">
            {t("explore")}
          </h2>
          <ul className="mt-3">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex min-h-11 items-center hover:text-saffron">
                  {tn(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-languages">
          <h2 id="footer-languages" className="font-sans text-sm font-normal text-cream/60">
            {t("languages")}
          </h2>
          <LanguageLinks className="-mx-3 mt-3 [&_a]:hover:bg-cream/10 [&_a[aria-current]]:text-saffron" />
        </nav>

        <div>
          <h2 className="text-2xl">{t("newsletterTitle")}</h2>
          <p className="mt-2 mb-5 text-cream/75">{t("newsletterBody")}</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-page space-y-1.5 border-t border-cream/10 py-6 text-sm text-cream/60">
        <p>{t("demoNote")}</p>
        <p>
          {t("credits")}{" "}
          <Link href="/credits" className="underline underline-offset-2 hover:text-saffron">
            {t("creditsLink")}
          </Link>
        </p>
        <p>{t("translations")}</p>
      </div>
    </footer>
  );
}
