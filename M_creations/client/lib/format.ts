const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatRate(rate: number | null): string {
  return rate === null ? 'Rate coming soon' : rupees.format(rate);
}

export const SHOP_PHONE = '98732 41323';
export const SHOP_PHONE_LINK = 'tel:+919873241323';

export function whatsappLink(message = 'Hello M Creations, I would like to know more.'): string {
  return `https://wa.me/919873241323?text=${encodeURIComponent(message)}`;
}

/** Asks Cloudinary for a sized, compressed copy. Other image links are left as they are. */
export function imageSrc(url: string, width: number): string {
  const marker = '/image/upload/';
  if (!url.includes('res.cloudinary.com') || !url.includes(marker)) return url;
  return url.replace(marker, `${marker}f_auto,q_auto,w_${width}/`);
}

/** Only follow redirects within this site. */
export function safeNext(next: unknown, fallback: string): string {
  return typeof next === 'string' && /^\/(?![/\\])/.test(next) ? next : fallback;
}
