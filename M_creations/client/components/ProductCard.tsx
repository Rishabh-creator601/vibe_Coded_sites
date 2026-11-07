import Link from 'next/link';
import { formatRate } from '@/lib/format';
import type { Product } from '@/lib/types';
import { ClothSwatch } from './ClothSwatch';

export function ColorDots({ product }: { product: Product }) {
  if (!product.colors.length) return null;
  return (
    <span
      className="flex gap-1"
      role="img"
      aria-label={`Colours: ${product.colors.map((c) => c.name).join(', ')}`}
    >
      {product.colors.slice(0, 5).map((color) => (
        <span
          key={color.name + color.hex}
          className="size-3.5 rounded-full border border-ink/25"
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </span>
  );
}

export function ProductCard({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <Link href={`/product/${product.slug}`} className="group flex h-full flex-col">
      <ClothSwatch
        product={product}
        width={large ? 1000 : 500}
        className={large ? 'aspect-[4/5] lg:aspect-auto lg:flex-1' : 'aspect-[4/5]'}
      />
      <span className="mt-3 block font-semibold leading-snug group-hover:underline">{product.name}</span>
      <span className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <span className={product.rate === null ? 'text-sm text-muted' : 'font-semibold text-rani'}>
          {formatRate(product.rate)}
        </span>
        <ColorDots product={product} />
      </span>
    </Link>
  );
}
