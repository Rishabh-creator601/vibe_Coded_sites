import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { ApiError, apiGet } from '@/lib/server-api';
import type { Category, Product } from '@/lib/types';

export const metadata: Metadata = { title: 'Edit piece' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product: Product;
  try {
    ({ product } = await apiGet<{ product: Product }>(`/api/admin/products/${encodeURIComponent(id)}`));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const { categories } = await apiGet<{ categories: Category[] }>('/api/categories');

  return (
    <>
      <h1 className="text-4xl text-rani">Edit {product.name}</h1>
      <ProductForm product={product} categories={categories} />
    </>
  );
}
