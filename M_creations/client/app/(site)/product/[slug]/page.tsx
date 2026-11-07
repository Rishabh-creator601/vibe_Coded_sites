import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/ProductGallery';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { formatRate } from '@/lib/format';
import { ApiError, apiGet } from '@/lib/server-api';
import type { Product } from '@/lib/types';

async function loadProduct(slug: string) {
  try {
    return (await apiGet<{ product: Product }>(`/api/products/${encodeURIComponent(slug)}`)).product;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await loadProduct((await params).slug);
  return { title: product.name, description: product.description || undefined };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await loadProduct((await params).slug);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-5 pt-8 md:grid-cols-2 md:gap-14 md:px-8">
      <ProductGallery product={product} />
      <div>
        {product.category && (
          <Link href={`/catalog/${product.category.slug}`} className="font-medium underline underline-offset-4">
            {product.category.name}
          </Link>
        )}
        <h1 className="mt-3 text-5xl text-rani">{product.name}</h1>
        <p className={product.rate === null ? 'mt-4 text-xl text-muted' : 'mt-4 text-3xl font-semibold'}>
          {formatRate(product.rate)}
        </p>

        {product.colors.length > 0 && (
          <div className="mt-8">
            <h2 className="font-sans text-lg font-semibold">Colours</h2>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
              {product.colors.map((color) => (
                <li key={color.name + color.hex} className="flex items-center gap-2">
                  <span
                    className="size-6 rounded-full border border-ink/25"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <h2 className="font-sans text-lg font-semibold">About this piece</h2>
          <p className="mt-2 max-w-prose whitespace-pre-line">
            {product.description || 'Description coming soon. Ask on WhatsApp for the details.'}
          </p>
        </div>

        <WhatsAppButton
          className="btn btn-peacock mt-8 w-full sm:w-auto"
          message={`Hello M Creations, I would like to know more about the ${product.name}.`}
        >
          Ask about this on WhatsApp
        </WhatsAppButton>
        <p className="mt-3 text-sm text-muted">Online ordering is not open yet.</p>
      </div>
    </main>
  );
}
