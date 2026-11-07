import { Bowlby_One, Familjen_Grotesk } from 'next/font/google';

export const display = Bowlby_One({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-display',
});

export const body = Familjen_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-body',
});
