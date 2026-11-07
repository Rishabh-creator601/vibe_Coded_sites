import type { Metadata } from 'next';
import { ProductForm } from '@/components/admin/ProductForm';
import { apiGet } from '@/lib/server-api';
import type { Category } from '@/lib/types';

export const metadata: Metadata = { title: 'Add a piece' };

export default async function NewProductPage() {
  const { categories } = await apiGet<{ categories: Category[] }>('/api/categories');
  return (
    <>
      <h1 className="text-4xl text-rani">Add a piece</h1>
      <ProductForm categories={categories} />
    </>
  );
}
