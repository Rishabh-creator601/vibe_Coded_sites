import "./globals.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { demoSettings, LOCALES } from "@saffron/shared";
import { routing } from "@/i18n/routing";
import { fontClasses } from "@/lib/fonts";
import { CartDrawer, MobileCartBar } from "@/components/cart/cart-drawer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreHydration } from "@/lib/use-hydrated";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s | ${demoSettings.cafeName}` },
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries([...LOCALES.map((l) => [l, `/${l}`]), ["x-default", "/en"]]),
    },
    openGraph: { type: "website", siteName: demoSettings.cafeName, title: t("title"), description: t("description"), locale: `${locale}_IN` },
  };
}

export const viewport: Viewport = {
  themeColor: "#f5e9d7",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html lang={locale} className={`${fontClasses(locale)} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only z-50 rounded-full bg-roast px-5 py-3 text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t("skip")}
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter settings={demoSettings} />
          <CartDrawer />
          <MobileCartBar />
          <ChatWidget />
          <StoreHydration />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
