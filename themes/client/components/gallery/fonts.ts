import {
  Anybody,
  Archivo,
  Bowlby_One,
  Cormorant_Garamond,
  Courier_Prime,
  Figtree,
  IM_Fell_English,
  Kalam,
  Limelight,
  Rozha_One,
  Shippori_Mincho,
  Shrikhand,
} from 'next/font/google';

// The large preview names each theme in that theme's own typeface.
const fell = IM_Fell_English({ subsets: ['latin'], weight: '400', display: 'swap' });
const rozha = Rozha_One({ subsets: ['latin'], weight: '400', display: 'swap' });
const bowlby = Bowlby_One({ subsets: ['latin'], weight: '400', display: 'swap' });
const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], display: 'swap' });
const kalam = Kalam({ subsets: ['latin'], weight: '700', display: 'swap' });
const limelight = Limelight({ subsets: ['latin'], weight: '400', display: 'swap' });
const shrikhand = Shrikhand({ subsets: ['latin'], weight: '400', display: 'swap' });
const courier = Courier_Prime({ subsets: ['latin'], weight: '700', display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: '500', style: 'italic', display: 'swap' });
const shippori = Shippori_Mincho({ subsets: ['latin'], weight: '500', display: 'swap' });

export const headline = Anybody({ subsets: ['latin'], axes: ['wdth'], display: 'swap', variable: '--font-headline' });
export const reading = Figtree({ subsets: ['latin'], weight: ['400', '500', '600'], display: 'swap', variable: '--font-reading' });

export const THEME_FONTS: Record<string, string> = {
  'night-chart': fell.className,
  'meter-kaapi': rozha.className,
  'riso-zine': bowlby.className,
  departures: archivo.className,
  'cupping-notes': kalam.className,
  'marine-drive': limelight.className,
  supergraphic: shrikhand.className,
  receipt: courier.className,
  herbarium: cormorant.className,
  kissa: shippori.className,
};
