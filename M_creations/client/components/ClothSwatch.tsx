import { imageSrc } from '@/lib/format';
import type { Product } from '@/lib/types';
import { ChalkDraft, draftKindFor } from './ChalkDraft';

const INK = '#2a0f28';
const CHALK = '#fff8f0';
const DEFAULT_CLOTH = '#0b4f56';

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Light chalk on dark cloth, dark marks on light cloth, whichever reads better. */
export function chalkColorOn(hex: string) {
  const cloth = luminance(hex);
  const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  return contrast(cloth, luminance(CHALK)) >= contrast(cloth, luminance(INK)) ? CHALK : INK;
}

/** Shows the piece's main photo, or until there is one, a chalk draft on its own colour of cloth. */
export function ClothSwatch({
  product,
  width = 600,
  className = 'aspect-[4/5]',
}: {
  product: Pick<Product, 'name' | 'slug' | 'colors' | 'images' | 'category'>;
  width?: number;
  className?: string;
}) {
  const photo = product.images[0];
  if (photo) {
    return (
      <div className={`pinked relative overflow-hidden bg-blush ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc(photo.url, width)}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  const cloth = product.colors[0]?.hex ?? DEFAULT_CLOTH;
  return (
    <div
      className={`cloth pinked relative overflow-hidden ${className}`}
      style={{ backgroundColor: cloth, color: chalkColorOn(cloth) }}
    >
      <ChalkDraft
        kind={draftKindFor(product.category?.slug)}
        slug={product.slug}
        className="absolute inset-x-[8%] top-[5%] bottom-[12%] m-auto h-[83%] w-[84%]"
      />
      <span className="absolute inset-x-0 bottom-4 text-center text-sm font-medium">Photo coming soon</span>
    </div>
  );
}
