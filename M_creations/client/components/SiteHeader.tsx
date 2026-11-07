import Link from 'next/link';
import type { User } from '@/lib/types';
import { SiteNav } from './SiteNav';
import { WhatsAppButton } from './WhatsAppButton';

/** No background of its own: only the cloth tags catch clicks, and the page shows between them. */
export function SiteHeader({ user }: { user: User | null }) {
  return (
    <header className="pointer-events-none sticky top-0 z-50 h-[var(--header-h)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-x-4 px-3 md:px-8">
        <Link href="/" className="tag tag-logo z-10">
          M Creations
        </Link>
        <div className="relative z-10 flex items-start gap-1.5 xl:order-last">
          {user?.role === 'admin' && (
            <Link href="/admin" className="tag">
              <span className="sm:hidden">Admin</span>
              <span className="max-sm:hidden">Dashboard</span>
            </Link>
          )}
          {user ? (
            <Link href="/account" className="tag">
              <span className="sm:hidden">Account</span>
              <span className="max-sm:hidden">My account</span>
            </Link>
          ) : (
            <Link href="/login" className="tag">
              Log in
            </Link>
          )}
          <WhatsAppButton className="tag tag-peacock">
            <span className="max-sm:sr-only">WhatsApp</span>
          </WhatsAppButton>
        </div>
        <SiteNav />
      </div>
    </header>
  );
}
