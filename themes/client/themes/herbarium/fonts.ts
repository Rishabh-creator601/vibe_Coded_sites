import { Alegreya_Sans, Cormorant_Garamond } from 'next/font/google';

const display = Cormorant_Garamond({
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});
const body = Alegreya_Sans({ weight: ['400', '500', '700'], subsets: ['latin'], display: 'swap', variable: '--font-body' });

export const fonts = `${display.variable} ${body.variable}`;
