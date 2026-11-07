'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { imageSrc } from '@/lib/format';
import { ClothSwatch } from './ClothSwatch';

export function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  const { images } = product;
  const shown = images[selected] ? { ...product, images: [images[selected]] } : product;

  return (
    <div>
      <ClothSwatch product={shown} width={1200} />
      {images.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show photo ${index + 1} of ${images.length}`}
                aria-pressed={index === selected}
                className={`block size-20 overflow-hidden border-2 ${
                  index === selected ? 'border-rani' : 'border-transparent'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(image.url, 200)} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
