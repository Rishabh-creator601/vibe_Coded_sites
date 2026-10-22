import { getLocale, getTranslations } from "next-intl/server";
import { demoSettings, formatClock, pick, toMinutes, type Locale } from "@saffron/shared";
import { ContactForm } from "@/components/contact/contact-form";

export async function generateMetadata() {
  const t = await getTranslations("contact");
  return { title: t("title") };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const tv = await getTranslations("visit");
  const tp = await getTranslations("periods");
  const locale = (await getLocale()) as Locale;
  const s = demoSettings;
  const range = (a: string, b: string) => `${formatClock(toMinutes(a), locale)} – ${formatClock(toMinutes(b), locale)}`;
  const hours = [...s.mealPeriods.map((p) => ({ label: tp(p.key), value: range(p.start, p.end) })), { label: tp("teaCoffee"), value: range(s.openingHours.start, s.openingHours.end) }];

  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <h1 className="text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-roast-soft">{t("intro")}</p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.45fr_0.55fr] lg:gap-14">
        <ContactForm />

        <aside aria-labelledby="find-us">
          <h2 id="find-us" className="text-3xl">
            {t("findUs")}
          </h2>
          <dl className="mt-5 grid gap-5">
            <div>
              <dt className="text-sm text-roast-soft">{tv("address")}</dt>
              <dd className="mt-1 text-lg">{pick(s.address, locale)}</dd>
            </div>
            <div>
              <dt className="text-sm text-roast-soft">{tv("phone")}</dt>
              <dd className="mt-1 text-lg">
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="link-underline font-normal tabular-nums">
                  {s.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-roast-soft">{tv("email")}</dt>
              <dd className="mt-1 text-lg">
                <a href={`mailto:${s.email}`} className="link-underline font-normal break-all">
                  {s.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-roast-soft">
                {tv("hours")}, {tv("everyDay")}
              </dt>
              <dd className="mt-1">
                <ul>
                  {hours.map((h) => (
                    <li key={h.label} className="flex justify-between gap-4 border-b border-line py-2 last:border-0">
                      <span>{h.label}</span>
                      <span className="tabular-nums">{h.value}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
