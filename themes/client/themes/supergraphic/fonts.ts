import { Sen, Shrikhand } from 'next/font/google';

const display = Shrikhand({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-display' });
const body = Sen({ subsets: ['latin'], display: 'swap', variable: '--font-body' });

export const fonts = `${display.variable} ${body.variable}`;
