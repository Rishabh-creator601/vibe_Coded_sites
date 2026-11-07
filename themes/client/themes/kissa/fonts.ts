import { Shippori_Mincho } from 'next/font/google';

const mincho = Shippori_Mincho({ weight: ['400', '500', '700'], subsets: ['latin'], display: 'swap', variable: '--font-mincho' });

export const fonts = mincho.variable;
