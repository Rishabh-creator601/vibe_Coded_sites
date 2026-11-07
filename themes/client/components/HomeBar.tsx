'use client';

import { Figtree } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './HomeBar.module.css';

const figtree = Figtree({ subsets: ['latin'], weight: '700', display: 'swap' });

/**
 * The way back from any theme. The strip scrolls away with the page and keeps the theme's own
 * header clear at the top. The button stays pinned to the top left.
 */
export function HomeBar() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <div className={`${styles.strip} ${figtree.className}`}>
      <Link className={styles.button} href="/">
        <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
          <path
            d="M7 3 2.5 8 7 13M3 8h10.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to home
      </Link>
    </div>
  );
}
