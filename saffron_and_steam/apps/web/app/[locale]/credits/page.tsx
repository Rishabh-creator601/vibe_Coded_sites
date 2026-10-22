import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { demoMenu, photoCredits, pick, type Locale } from "@saffron/shared";

export async function generateMetadata() {
  const t = await getTranslations("credits");
  return { title: t("title") };
}

export default async function CreditsPage() {
  const t = await getTranslations("credits");
  const tg = await getTranslations("gallery");
  const locale = (await getLocale()) as Locale;

  const rows = Object.entries(photoCredits).map(([key, credit]) => {
    const [folder, slug] = key.split("/");
    const dish = folder === "dishes" ? demoMenu.find((i) => i.slug === slug) : undefined;
    return { key, src: `/images/${key}.jpg`, title: dish ? pick(dish.name, locale) : tg(`photos.${slug}`), credit };
  });

  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <h1 className="text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-roast-soft">{t("intro")}</p>
      <ul className="mt-10 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ key, src, title, credit }) => (
          <li key={key} className="flex items-center gap-4 border-b border-line py-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-line">
              <Image src={src} alt="" fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-roast">{title}</p>
              <p className="truncate text-roast-soft">
                {credit.author}, {credit.license}
              </p>
              <a href={credit.href} target="_blank" rel="noopener noreferrer" className="link-underline font-medium">
                {t("view", { source: credit.source })}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
