'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

function Glyph({ viewBox, strokeWidth, children }: { viewBox: string; strokeWidth: number; children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="hidden size-6 shrink-0 md:block"
    >
      {children}
    </svg>
  );
}

// The same chalk drafts the cloth swatches use, drawn small.
const BLOUSE = (
  <Glyph viewBox="40 60 320 270" strokeWidth={20}>
    <path d="M140 90 C142 150 180 178 200 152 C220 178 258 150 260 90" />
    <path d="M260 90 L305 106 L346 190 L300 206 L282 152 L276 300 Q200 320 124 300 L118 152 L100 206 L54 190 L95 106 L140 90" />
  </Glyph>
);

const KRISHNA = (
  <Glyph viewBox="60 0 280 385" strokeWidth={24}>
    <path d="M165 88 L168 54 L184 70 L200 42 L216 70 L232 54 L235 88 Z" />
    <path d="M204 42 C204 30 210 20 222 14 C234 2 250 8 246 20" />
    <path d="M172 118 L228 118 L228 182 C250 244 288 306 316 344 Q200 382 84 344 C112 306 150 244 172 182 Z" />
  </Glyph>
);

const KURTI = (
  <Glyph viewBox="60 40 280 335" strokeWidth={22}>
    <path d="M162 58 Q200 100 238 58" />
    <path d="M238 58 L282 74 L322 190 L288 202 L262 122 L270 252 L288 352 Q200 372 112 352 L130 252 L138 122 L112 202 L78 190 L118 74 L162 58" />
  </Glyph>
);

const PHONE = (
  <Glyph viewBox="0 0 24 24" strokeWidth={1.7}>
    <path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Glyph>
);

// Colours match the category panels on the home page.
const LINKS = [
  { href: '/catalog/blouses', label: 'Blouses', short: 'Blouses', cloth: 'tag-peacock', glyph: BLOUSE },
  { href: '/catalog/krishna-dresses', label: 'Lord Krishna dresses', short: 'Krishna', cloth: 'tag-marigold', glyph: KRISHNA },
  { href: '/catalog/ready-made', label: 'Ready-made items', short: 'Ready-made', cloth: 'tag-aubergine', glyph: KURTI },
  { href: '/#contact', label: 'Contact', short: 'Contact', cloth: 'tag-maroon', glyph: PHONE },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Catalog" className="w-full xl:w-auto">
      <ul className="grid grid-cols-[1fr_1fr_1.3fr_1fr] gap-1.5 md:flex md:gap-3">
        {LINKS.map((link) => (
          <li key={link.href} className={`tag-string ${link.cloth}`}>
            <Link
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
              className="tag tag-nav"
            >
              {link.glyph}
              <span className="md:hidden">{link.short}</span>
              <span className="max-md:hidden">{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
