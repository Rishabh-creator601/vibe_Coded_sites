import type { Metadata } from 'next';
import { CatalogView, pageFrom } from '@/components/CatalogView';
import { apiGet } from '@/lib/server-api';
import type { Category } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { categories } = await apiGet<{ categories: Category[] }>('/api/categories');
  return { title: categories.find((category) => category.slug === slug)?.name ?? 'Catalog' };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  return <CatalogView slug={slug} page={pageFrom(page)} />;
}
