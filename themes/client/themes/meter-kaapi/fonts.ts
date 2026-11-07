import { Baloo_Tamma_2, Mukta, Rozha_One } from 'next/font/google';

export const display = Rozha_One({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-display',
});

export const body = Mukta({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'swap',
  variable: '--font-body',
});

export const kannada = Baloo_Tamma_2({
  subsets: ['kannada'],
  weight: '700',
  display: 'swap',
  variable: '--font-kannada',
});
