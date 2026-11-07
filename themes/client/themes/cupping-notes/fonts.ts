import { Kalam, Karla } from 'next/font/google';

export const hand = Kalam({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-hand',
});

export const printed = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-printed',
});
