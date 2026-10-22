import { getLocale, getTranslations } from "next-intl/server";
import { demoCategories, demoMenu, photoCredits, pick, type Locale } from "@saffron/shared";
import { GalleryGrid, type GalleryCategory, type GalleryPhoto } from "@/components/gallery/gallery-grid";
import sizes from "@/lib/image-sizes.json";

const CAFE_PHOTOS = ["cafe-corner", "latte-art", "tandoor-naan", "coffee-bar", "pizza-in-oven", "coffee-beans", "dining-room", "pizza-oven"] as const;

export async function generateMetadata() {
  const t = await getTranslations("gallery");
  return { title: t("title") };
}

export default async function GalleryPage() {
  const t = await getTranslations("gallery");
  const locale = (await getLocale()) as Locale;
  const size = (src: string) => (sizes as Record<string, number[]>)[src] ?? [1200, 900];

  const dishes: GalleryPhoto[] = demoMenu.map((item) => {
    const img = item.images[0];
    const [width, height] = size(img.url);
    return {
      key: item.slug,
      src: img.url,
      width,
      height,
      title: pick(item.name, locale),
      alt: pick(img.alt, locale),
      category: item.category,
      credit: img.credit ? { author: img.credit.author, license: img.credit.license, href: img.credit.href } : null,
    };
  });
  const cafe: GalleryPhoto[] = CAFE_PHOTOS.map((key) => {
    const src = `/images/gallery/${key}.jpg`;
    const [width, height] = size(src);
    const credit = photoCredits[`gallery/${key}`];
    const title = t(`photos.${key}`);
    return { key, src, width, height, title, alt: title, category: "cafe", credit: credit ? { author: credit.author, license: credit.license, href: credit.href } : null };
  });

  // Mix a café photo in after every seventh dish so "All" isn't only plates.
  const photos = dishes.flatMap((d, i) => (i % 7 === 0 && cafe[i / 7] ? [cafe[i / 7], d] : [d]));
  const categories: { key: GalleryCategory; label: string }[] = [
    ...demoCategories.map((c) => ({ key: c.slug as GalleryCategory, label: pick(c.name, locale) })),
    { key: "cafe", label: t("cafe") },
  ];

  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <h1 className="text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-roast-soft">{t("intro")}</p>
      <GalleryGrid photos={photos} categories={categories} />
    </div>
  );
}
