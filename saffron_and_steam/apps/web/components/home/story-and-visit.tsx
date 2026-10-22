import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { demoMenu, formatClock, pick, toMinutes, type CafeSettings, type Locale } from "@saffron/shared";
import { Link } from "@/i18n/navigation";

export async function Story() {
  const t = await getTranslations("story");
  const locale = (await getLocale()) as Locale;
  const dosa = demoMenu.find((i) => i.slug === "masala-dosa")!.images[0];

  return (
    <section aria-labelledby="story-title" className="bg-roast text-cream">
      <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="relative aspect-[4/3] overflow-hidden rounded-photo bg-roast-soft lg:aspect-[5/4]">
          <Image src={dosa.url} alt={pick(dosa.alt, locale)} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[50%_35%]" />
        </div>
        <div className="max-w-xl">
          <h2 id="story-title" className="text-4xl leading-tight sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-cream/85">{t("p1")}</p>
          <p className="mt-4 text-lg leading-relaxed text-cream/85">{t("p2")}</p>
          <Link href="/about" className="link-underline mt-7 inline-block decoration-saffron hover:text-saffron">
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export async function Visit({ settings }: { settings: CafeSettings }) {
  const t = await getTranslations("visit");
  const tp = await getTranslations("periods");
  const locale = (await getLocale()) as Locale;
  const range = (start: string, end: string) => `${formatClock(toMinutes(start), locale)} – ${formatClock(toMinutes(end), locale)}`;
  const rows = [
    ...settings.mealPeriods.map((p) => ({ label: tp(p.key), value: range(p.start, p.end) })),
    { label: tp("teaCoffee"), value: range(settings.openingHours.start, settings.openingHours.end) },
  ];

  return (
    <section aria-labelledby="visit-title" className="container-page py-16 lg:py-24">
      <h2 id="visit-title" className="text-4xl leading-tight sm:text-5xl">
        {t("title")}
      </h2>
      <div className="mt-10 grid gap-10 md:grid-cols-2 lg:gap-16">
        <dl className="grid gap-6">
          <div>
            <dt className="text-sm text-roast-soft">{t("address")}</dt>
            <dd className="mt-1 text-lg">{pick(settings.address, locale)}</dd>
          </div>
          <div>
            <dt className="text-sm text-roast-soft">{t("phone")}</dt>
            <dd className="mt-1 text-lg">
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="link-underline font-normal tabular-nums">
                {settings.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-roast-soft">{t("email")}</dt>
            <dd className="mt-1 text-lg">
              <a href={`mailto:${settings.email}`} className="link-underline font-normal break-all">
                {settings.email}
              </a>
            </dd>
          </div>
        </dl>

        <div>
          <h3 className="font-sans text-sm font-normal text-roast-soft">
            {t("hours")}, {t("everyDay")}
          </h3>
          <dl className="mt-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-end gap-3 border-b border-line py-3">
                <dt className="text-lg">{r.label}</dt>
                <span className="leader" aria-hidden="true" />
                <dd className="text-lg tabular-nums">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
