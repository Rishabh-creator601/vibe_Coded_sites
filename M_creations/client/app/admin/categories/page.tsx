import type { Metadata } from 'next';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { apiGet } from '@/lib/server-api';
import type { Category } from '@/lib/types';

export const metadata: Metadata = { title: 'Categories' };

export default async function AdminCategories() {
  const { categories } = await apiGet<{ categories: Category[] }>('/api/categories');
  return (
    <>
      <h1 className="text-4xl text-rani">Categories</h1>
      {/* Remount after a rename so each row shows the saved name. */}
      <CategoryManager key={categories.map((c) => c.name).join()} categories={categories} />
    </>
  );
}
