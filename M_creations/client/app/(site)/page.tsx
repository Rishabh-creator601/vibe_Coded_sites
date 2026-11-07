import Link from 'next/link';
import { ChalkDraft, type DraftKind } from '@/components/ChalkDraft';
import { chalkColorOn } from '@/components/ClothSwatch';
import { ProductCard } from '@/components/ProductCard';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { SHOP_PHONE, SHOP_PHONE_LINK } from '@/lib/format';
import { apiGet } from '@/lib/server-api';
import type { ProductPage } from '@/lib/types';

function CategoryPanel({
  href,
  title,
  cloth,
  kind,
  slug,
  className = '',
}: {
  href: string;
  title: string;
  cloth: string;
  kind: DraftKind;
  slug?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`cloth pinked relative flex min-h-[26rem] flex-col overflow-hidden p-6 md:min-h-[32rem] ${className}`}
      style={{ backgroundColor: cloth, color: chalkColorOn(cloth) }}
    >
      <h3 className="text-4xl lg:text-5xl">{title}</h3>
      <ChalkDraft kind={kind} slug={slug} className="m-auto mt-4 w-full max-w-sm flex-1" />
    </Link>
  );
}

export default async function HomePage() {
  const { products } = await apiGet<ProductPage>('/api/products?limit=5');

  return (
    <main>
      <section className="cloth overflow-hidden bg-rani text-petal">
        <div className="mx-auto grid max-w-7xl items-center gap-4 px-5 pt-10 pb-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:px-8 md:py-16">
          <div>
            <h1 className="text-[clamp(4rem,11.5vw,10rem)] leading-[0.95]">M Creations</h1>
            <p className="mt-6 max-w-xl text-xl md:text-2xl">
              Blouses stitched to your measure, dresses for Lord Krishna, and ready-made items.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="btn bg-marigold text-ink hover:bg-petal">
                See the catalog
              </Link>
              <WhatsAppButton className="btn border border-petal text-petal hover:bg-rani-deep" />
            </div>
          </div>
          <ChalkDraft kind="blouse" animate className="mx-auto w-full max-w-sm text-petal md:max-w-md" />
        </div>
      </section>
      <div className="zari" />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <section className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-6" aria-label="Categories">
          <div className="lg:col-span-2">
            <h2 className="text-4xl text-rani">Stitching</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <CategoryPanel href="/catalog/blouses" title="Blouses" cloth="#0b4f56" kind="blouse" slug="boat" />
              <CategoryPanel
                href="/catalog/krishna-dresses"
                title="Lord Krishna dresses"
                cloth="#f0a316"
                kind="krishna"
              />
            </div>
          </div>
          <div>
            <h2 className="text-4xl text-rani">Ready-made</h2>
            <CategoryPanel
              href="/catalog/ready-made"
              title="Ready-made items"
              cloth="#3d1239"
              kind="kurti"
              className="mt-5"
            />
          </div>
        </section>

        <section className="mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-4xl text-rani">New in the catalog</h2>
            <Link href="/catalog" className="font-semibold underline underline-offset-4">
              See all pieces
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
            {products.map((product, index) => (
              <li key={product.id} className={index === 0 ? 'col-span-2 lg:row-span-2' : ''}>
                <ProductCard product={product} large={index === 0} />
              </li>
            ))}
          </ul>
        </section>

        <section id="contact" className="mt-20 scroll-mt-6 border-t-2 border-rani pt-10">
          <h2 className="text-4xl text-rani">Ask about any piece</h2>
          <p className="mt-4 max-w-2xl">
            Online ordering is not open yet. Message us on WhatsApp with the piece you like to ask about colours,
            measurements and timing.
          </p>
          <a href={SHOP_PHONE_LINK} className="mt-6 block font-display text-5xl hover:underline md:text-7xl">
            {SHOP_PHONE}
          </a>
          <WhatsAppButton className="btn btn-peacock mt-6" />
        </section>
      </div>
    </main>
  );
}
