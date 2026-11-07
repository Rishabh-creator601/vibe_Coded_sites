import Link from 'next/link';
import { apiGet } from '@/lib/server-api';

type Stats = { pieces: number; missingPhoto: number; missingRate: number; hidden: number; customers: number };

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export default async function AdminOverview() {
  const stats = await apiGet<Stats>('/api/admin/stats');
  const todo = [
    { count: stats.missingPhoto, text: plural(stats.missingPhoto, 'piece needs a photo', 'pieces need a photo'), href: '/admin/products?missing=photo' },
    { count: stats.missingRate, text: plural(stats.missingRate, 'piece needs a rate', 'pieces need a rate'), href: '/admin/products?missing=rate' },
  ].filter((item) => item.count > 0);

  return (
    <>
      <h1 className="text-4xl text-rani">Overview</h1>
      <p className="mt-3">
        {plural(stats.pieces, 'piece', 'pieces')} in the catalog, {stats.hidden} hidden.{' '}
        {plural(stats.customers, 'customer account', 'customer accounts')}.
      </p>

      <h2 className="mt-10 text-2xl">To fill in</h2>
      {todo.length ? (
        <ul className="mt-3 max-w-md divide-y divide-ink/15 border-y border-ink/15">
          {todo.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block py-3 font-medium hover:text-rani hover:underline">
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2">Every piece has a photo and a rate.</p>
      )}

      <Link href="/admin/products/new" className="btn btn-primary mt-8">
        Add a piece
      </Link>
    </>
  );
}
