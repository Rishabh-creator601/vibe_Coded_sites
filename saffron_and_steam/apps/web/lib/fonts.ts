import { Hind, Hind_Guntur, Hind_Siliguri, Tiro_Bangla, Tiro_Devanagari_Hindi, Tiro_Devanagari_Marathi, Tiro_Telugu } from "next/font/google";
import type { Locale } from "@saffron/shared";

// Tiro (serif headings) and Hind (body text) both come in Latin, Devanagari,
// Bengali and Telugu cuts, so every language keeps the same typographic voice.
// Only English/Hindi fonts are preloaded; the others load when their page is used.

const tiroHindi = Tiro_Devanagari_Hindi({ weight: "400", subsets: ["latin", "devanagari"], variable: "--font-display-locale", display: "swap" });
const tiroMarathi = Tiro_Devanagari_Marathi({ weight: "400", subsets: ["latin", "devanagari"], variable: "--font-display-locale", display: "swap", preload: false });
const tiroBangla = Tiro_Bangla({ weight: "400", subsets: ["latin", "bengali"], variable: "--font-display-locale", display: "swap", preload: false });
const tiroTelugu = Tiro_Telugu({ weight: "400", subsets: ["latin", "telugu"], variable: "--font-display-locale", display: "swap", preload: false });

const hind = Hind({ weight: ["400", "500", "600"], subsets: ["latin", "devanagari"], variable: "--font-body-locale", display: "swap" });
const hindSiliguri = Hind_Siliguri({ weight: ["400", "500", "600"], subsets: ["latin", "bengali"], variable: "--font-body-locale", display: "swap", preload: false });
const hindGuntur = Hind_Guntur({ weight: ["400", "500", "600"], subsets: ["latin", "telugu"], variable: "--font-body-locale", display: "swap", preload: false });

const byLocale: Record<Locale, string> = {
  en: `${tiroHindi.variable} ${hind.variable}`,
  hi: `${tiroHindi.variable} ${hind.variable}`,
  mr: `${tiroMarathi.variable} ${hind.variable}`,
  bn: `${tiroBangla.variable} ${hindSiliguri.variable}`,
  te: `${tiroTelugu.variable} ${hindGuntur.variable}`,
};

export function fontClasses(locale: Locale): string {
  return byLocale[locale];
}
