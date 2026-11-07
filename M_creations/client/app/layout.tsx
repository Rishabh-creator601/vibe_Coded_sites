import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Kalam, Mukta, Rozha_One } from 'next/font/google';
import './globals.css';

const rozha = Rozha_One({ weight: '400', subsets: ['latin'], variable: '--font-rozha' });
const mukta = Mukta({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-mukta' });
const kalam = Kalam({ weight: '400', subsets: ['latin'], variable: '--font-kalam' });

export const metadata: Metadata = {
  title: { default: 'M Creations | Stitching and tailoring', template: '%s | M Creations' },
  description: 'Blouses, Lord Krishna dresses and ready-made items from M Creations. Browse the catalog and ask on WhatsApp.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${rozha.variable} ${mukta.variable} ${kalam.variable}`}>
      <body>{children}</body>
    </html>
  );
}
