import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, apiGet } from '@/lib/server-api';
import type { Category, ProductPage } from '@/lib/types';
import { ProductCard } from './ProductCard';

export async function CatalogView({ slug, page }: { slug?: string; page: number }) {
  const { categories } = await apiGet<{ categories: Category[] }>('/api/categories');
  const active = categories.find((category) => category.slug === slug);
  if (slug && !active) notFound();

  const query = new URLSearchParams({ page: String(page) });
  if (slug) query.set('category', slug);
  let data: ProductPage;
  try {
    data = await apiGet<ProductPage>(`/api/products?${query}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) notFound();
    throw err;
  }

  const base = slug ? `/catalog/${slug}` : '/catalog';
  const tabs = [{ href: '/catalog', label: 'All pieces', current: !slug }].concat(
    categories.map((category) => ({
      href: `/catalog/${category.slug}`,
      label: category.name,
      current: category.slug === slug,
    }))
  );

  return (
    <main className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
      <h1 className="text-5xl text-rani md:text-7xl">{active?.name ?? 'Catalog'}</h1>
      <nav aria-label="Categories" className="mt-6 overflow-x-auto border-b border-ink/20">
        <ul className="flex gap-6 whitespace-nowrap">
          {tabs.map((tab) => (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={tab.current ? 'page' : undefined}
                className={`block border-b-[3px] py-2 ${
                  tab.current ? 'border-rani font-semibold text-rani' : 'border-transparent hover:border-ink/30'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {data.products.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-16">
          <p className="text-xl">No pieces here yet.</p>
          <Link href="/catalog" className="mt-2 inline-block font-semibold underline underline-offset-4">
            See all pieces
          </Link>
        </div>
      )}

      {data.pages > 1 && (
        <nav aria-label="Pages" className="mt-10 flex items-center gap-4">
          {page > 1 && (
            <Link className="btn btn-quiet" href={`${base}?page=${page - 1}`}>
              Previous page
            </Link>
          )}
          <span>
            Page {page} of {data.pages}
          </span>
          {page < data.pages && (
            <Link className="btn btn-quiet" href={`${base}?page=${page + 1}`}>
              Next page
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}

export function pageFrom(value: string | string[] | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
