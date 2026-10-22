import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Coffee, Leaf, UtensilsCrossed } from "lucide-react";
import { demoMenu } from "@saffron/shared";
import { Link } from "@/i18n/navigation";

export async function generateMetadata() {
  const t = await getTranslations("about");
  return { title: t("title") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const ts = await getTranslations("story");
  const tn = await getTranslations("nav");
  const photo = (slug: string) => demoMenu.find((i) => i.slug === slug)!.images[0];
  const values = [
    { icon: Leaf, title: t("fresh"), body: t("freshBody") },
    { icon: Coffee, title: t("coffee"), body: t("coffeeBody") },
    { icon: UtensilsCrossed, title: t("kitchens"), body: t("kitchensBody") },
  ];
  const strip = ["masala-dosa", "tonkotsu-ramen", "margherita-pizza", "croque-monsieur", "buttermilk-pancakes"].map(photo);

  return (
    <>
      <div className="container-page grid gap-10 pt-10 pb-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16 lg:pt-14">
        <div>
          <h1 className="text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
          <p className="mt-6 text-xl leading-relaxed">{ts("p1")}</p>
          <p className="mt-4 text-lg leading-relaxed text-roast-soft">{ts("p2")}</p>
          <p className="mt-4 text-lg leading-relaxed text-roast-soft">{t("p3")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary">
              {t("cta")}
            </Link>
            <Link href="/reserve" className="btn btn-outline">
              {tn("reserve")}
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-photo bg-line">
          <Image src="/images/gallery/cafe-corner.jpg" alt="" fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
        </div>
      </div>

      <ul className="flex gap-3 overflow-hidden px-4 pb-16 sm:gap-4" aria-hidden="true">
        {strip.map((img) => (
          <li key={img.url} className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-2xl bg-line">
            <Image src={img.url} alt="" fill sizes="20vw" className="object-cover" />
          </li>
        ))}
      </ul>

      <section aria-labelledby="values" className="bg-roast text-cream">
        <div className="container-page py-16 lg:py-24">
          <h2 id="values" className="text-4xl sm:text-5xl">
            {t("valuesTitle")}
          </h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
            {values.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <Icon className="size-8 text-saffron" aria-hidden="true" />
                <h3 className="mt-4 text-2xl">{title}</h3>
                <p className="mt-2 leading-relaxed text-cream/80">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
