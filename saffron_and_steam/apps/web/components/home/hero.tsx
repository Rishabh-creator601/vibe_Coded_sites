import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { demoMenu, formatPrice, pick, type CafeSettings, type Locale } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { DietMark } from "@/components/diet-mark";
import { DayRibbon } from "./day-ribbon";
import { LiveStatus } from "./live-status";

export async function Hero({ settings }: { settings: CafeSettings }) {
  const t = await getTranslations("hero");
  const tf = await getTranslations("featured");
  const tp = await getTranslations("periods");
  const locale = (await getLocale()) as Locale;
  const chai = demoMenu.find((i) => i.slug === "masala-chai")!;

  return (
    <section className="container-page pt-8 pb-16 sm:pt-12 lg:pt-10 lg:pb-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <div>
          <LiveStatus settings={settings} />
          <h1 className="mt-5 text-[clamp(2.6rem,6.4vw,4.6rem)] leading-[1.04] tracking-[-0.01em]">{pick(settings.tagline, locale)}</h1>
          <p className="mt-6 max-w-[34rem] text-lg text-roast-soft sm:text-xl">{t("lede")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary">
              {t("order")}
            </Link>
            <Link href="/reserve" className="btn btn-outline">
              {t("reserve")}
            </Link>
          </div>
        </div>

        <figure className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-photo bg-line sm:aspect-square lg:aspect-[6/6.4]">
            <Image
              src={chai.images[0].url}
              alt={pick(chai.images[0].alt, locale)}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[50%_60%]"
            />
          </div>
          <figcaption className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-2xl bg-paper/95 px-4 py-2.5 shadow-[0_8px_24px_-12px_rgb(42_26_18/0.5)] sm:bottom-6 sm:left-6">
            <DietMark diet={chai.diet} label={tf(`diet.${chai.diet}`)} />
            <span className="font-display text-lg leading-tight">{pick(chai.name, locale)}</span>
            <span className="font-semibold tabular-nums">{formatPrice(chai.price, locale)}</span>
            <span className="text-sm text-roast-soft">{tp("teaCoffee")}</span>
          </figcaption>
        </figure>
      </div>

      <DayRibbon settings={settings} />
    </section>
  );
}
