import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // The [locale] segment sits above the root layout, so Next exposes it as a root
  // param. Reading it this way keeps pages statically renderable.
  if (!locale) {
    const param = await rootLocale();
    locale = hasLocale(routing.locales, param) ? param : routing.defaultLocale;
  }
  return {
    locale,
    timeZone: "Asia/Kolkata",
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
