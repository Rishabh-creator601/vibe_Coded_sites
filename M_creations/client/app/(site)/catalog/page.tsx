import type { Metadata } from 'next';
import { CatalogView, pageFrom } from '@/components/CatalogView';

export const metadata: Metadata = { title: 'Catalog' };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page } = await searchParams;
  return <CatalogView page={pageFrom(page)} />;
}
