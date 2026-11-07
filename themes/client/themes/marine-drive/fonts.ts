import { Josefin_Sans, Limelight } from 'next/font/google';

const display = Limelight({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-display' });
const body = Josefin_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-body' });

export const fonts = `${display.variable} ${body.variable}`;
