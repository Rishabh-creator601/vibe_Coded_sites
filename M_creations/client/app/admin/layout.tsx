import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { LogoutButton } from '@/components/LogoutButton';
import { getCurrentUser } from '@/lib/server-api';

export const metadata: Metadata = { title: { default: 'Dashboard', template: '%s | M Creations dashboard' } };

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/products', label: 'Pieces' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/', label: 'View the site' },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin') redirect('/');

  return (
    <div className="min-h-screen md:grid md:grid-cols-[14rem_1fr]">
      <aside className="bg-ink px-5 py-4 text-petal md:py-6">
        <Link href="/admin" className="font-display text-2xl leading-none">
          M Creations
        </Link>
        <nav aria-label="Dashboard" className="mt-3 md:mt-8">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 md:block md:space-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <LogoutButton className="cursor-pointer hover:underline" />
            </li>
          </ul>
        </nav>
      </aside>
      <main className="min-w-0 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
