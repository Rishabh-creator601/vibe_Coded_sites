import { Courier_Prime, Libre_Barcode_39 } from 'next/font/google';

const mono = Courier_Prime({ weight: ['400', '700'], subsets: ['latin'], display: 'swap', variable: '--font-mono' });
const barcode = Libre_Barcode_39({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-barcode' });

export const fonts = `${mono.variable} ${barcode.variable}`;
