import { getLocale, getTranslations } from "next-intl/server";
import { Bike, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { formatNumber, formatPrice, type CafeSettings, type Locale } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { DeliveryChecker } from "./delivery-checker";

export async function WaysToOrder({ settings }: { settings: CafeSettings }) {
  const t = await getTranslations("ways");
  const locale = (await getLocale()) as Locale;
  const iconClass = "size-7 text-kulhad";

  return (
    <section aria-labelledby="ways-title" className="container-page py-16 lg:py-24">
      <h2 id="ways-title" className="text-4xl leading-tight sm:text-5xl">
        {t("title")}
      </h2>

      <div className="mt-10 grid divide-y divide-line border-y border-line lg:grid-cols-[1fr_1fr_1.25fr] lg:divide-x lg:divide-y-0">
        <div className="py-8 lg:py-10 lg:pr-10">
          <ShoppingBag className={iconClass} aria-hidden="true" />
          <h3 className="mt-4 text-2xl sm:text-3xl">{t("pickupTitle")}</h3>
          <p className="mt-3 max-w-sm text-roast-soft">{t("pickupBody", { minutes: formatNumber(settings.pickupLeadMinutes, locale) })}</p>
          <Link href={{ pathname: "/menu", query: { order: "pickup" } }} className="link-underline mt-5 inline-block">
            {t("pickupCta")}
          </Link>
        </div>

        <div className="py-8 lg:px-10 lg:py-10">
          <UtensilsCrossed className={iconClass} aria-hidden="true" />
          <h3 className="mt-4 text-2xl sm:text-3xl">{t("dineTitle")}</h3>
          <p className="mt-3 max-w-sm text-roast-soft">{t("dineBody", { max: formatNumber(settings.reservation.maxPartySize, locale) })}</p>
          <Link href="/reserve" className="link-underline mt-5 inline-block">
            {t("dineCta")}
          </Link>
        </div>

        <div className="py-8 lg:py-10 lg:pl-10">
          <Bike className={iconClass} aria-hidden="true" />
          <h3 className="mt-4 text-2xl sm:text-3xl">{t("deliveryTitle")}</h3>
          <p className="mt-3 max-w-md text-roast-soft">{t("deliveryBody", { amount: formatPrice(settings.delivery.freeDeliveryAbove, locale) })}</p>
          <DeliveryChecker settings={settings} />
        </div>
      </div>
    </section>
  );
}
