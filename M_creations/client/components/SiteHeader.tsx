import Link from 'next/link';
import type { User } from '@/lib/types';
import { WhatsAppButton } from './WhatsAppButton';

const LINKS = [
  { href: '/catalog/blouses', label: 'Blouses' },
  { href: '/catalog/krishna-dresses', label: 'Lord Krishna dresses' },
  { href: '/catalog/ready-made', label: 'Ready-made items' },
  { href: '/#contact', label: 'Contact' },
];

export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3 md:px-8">
      <Link href="/" className="font-display text-3xl leading-none text-rani">
        M Creations
      </Link>
      <div className="ml-auto flex items-center gap-4 lg:order-last">
        {user?.role === 'admin' && (
          <Link href="/admin" className="font-medium hover:underline">
            Dashboard
          </Link>
        )}
        {user ? (
          <Link href="/account" className="font-medium hover:underline">
            My account
          </Link>
        ) : (
          <Link href="/login" className="font-medium hover:underline">
            Log in
          </Link>
        )}
        <WhatsAppButton className="btn btn-peacock max-sm:px-3">
          <span className="max-sm:sr-only">WhatsApp</span>
        </WhatsAppButton>
      </div>
      <nav aria-label="Catalog" className="w-full overflow-x-auto lg:w-auto">
        <ul className="flex gap-5 whitespace-nowrap py-1">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-rani hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
