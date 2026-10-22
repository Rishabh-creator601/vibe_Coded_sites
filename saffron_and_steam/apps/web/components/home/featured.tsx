import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { demoCategories, formatPrice, pick, type CafeSettings, type Locale, type MenuItem } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { DietMark } from "@/components/diet-mark";
import { AddToCartButton } from "./add-to-cart-button";
import { AvailabilityNote } from "./availability-note";

type T = Awaited<ReturnType<typeof getTranslations<"featured">>>;

function Tags({ item, t }: { item: MenuItem; t: T }) {
  const tags = item.tags.filter((tag) => tag === "chefSpecial" || tag === "bestseller");
  return tags.map((tag) => (
    <span key={tag} className="font-semibold text-kulhad">
      {t(tag)}
    </span>
  ));
}

export async function Featured({ items, settings }: { items: MenuItem[]; settings: CafeSettings }) {
  const t = await getTranslations("featured");
  const locale = (await getLocale()) as Locale;
  const order = (i: MenuItem) => demoCategories.findIndex((c) => c.slug === i.category) * 100 + i.sortOrder;
  const withPhotos = items.filter((i) => i.images.length > 0).sort((a, b) => order(a) - order(b));
  // The first chef's special gets the big photo; the rest read like a menu card.
  const special = withPhotos.find((i) => i.tags.includes("chefSpecial")) ?? withPhotos[0];
  const list = withPhotos.filter((i) => i !== special);
  if (!special) return null;

  return (
    <section aria-labelledby="featured-title" className="border-t border-line bg-paper/60 py-16 lg:py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h2 id="featured-title" className="text-4xl leading-tight sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-3 max-w-xl text-roast-soft">{t("intro")}</p>
          </div>
          <Link href="/menu" className="link-underline">
            {t("fullMenu")}
          </Link>
        </div>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <article className="self-start lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-photo bg-line">
              <Image
                src={special.images[0].url}
                alt={pick(special.images[0].alt, locale)}
                fill
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-x-3 text-sm">
              <Tags item={special} t={t} />
              <AvailabilityNote item={special} settings={settings} />
            </div>
            <h3 className="mt-2 flex items-center gap-3 text-3xl leading-tight sm:text-4xl">
              <DietMark diet={special.diet} label={t(`diet.${special.diet}`)} size={20} />
              {pick(special.name, locale)}
            </h3>
            <p className="mt-3 max-w-[36rem] text-roast-soft">{pick(special.description, locale)}</p>
            <div className="mt-5 flex items-center gap-5">
              <span className="text-2xl font-semibold tabular-nums">{formatPrice(special.price, locale)}</span>
              <AddToCartButton slug={special.slug} name={pick(special.name, locale)} disabled={!special.isAvailable} large />
            </div>
          </article>

          <ul>
            {list.map((item) => {
              const name = pick(item.name, locale);
              return (
                <li key={item.slug} className="flex gap-4 border-b-2 border-dotted border-line py-6 first:pt-0 sm:gap-6">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-line sm:size-28">
                    <Image src={item.images[0].url} alt={pick(item.images[0].alt, locale)} fill sizes="112px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-end gap-3">
                      <h3 className="text-xl leading-snug sm:text-2xl">
                        <span className="mr-2 inline-block align-[-1px]">
                          <DietMark diet={item.diet} label={t(`diet.${item.diet}`)} />
                        </span>
                        {name}
                      </h3>
                      <span className="leader hidden sm:block" aria-hidden="true" />
                      <span className="ml-auto shrink-0 pb-0.5 font-semibold tabular-nums sm:ml-0">{formatPrice(item.price, locale)}</span>
                    </div>
                    <p className="mt-1.5 text-[0.98rem] text-roast-soft">{pick(item.description, locale)}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-x-3 text-sm">
                        <Tags item={item} t={t} />
                        <AvailabilityNote item={item} settings={settings} />
                      </div>
                      <AddToCartButton slug={item.slug} name={name} disabled={!item.isAvailable} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
