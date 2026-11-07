import type { Metadata } from 'next';
import Link from 'next/link';
import { formatRate, imageSrc } from '@/lib/format';
import { apiGet } from '@/lib/server-api';
import type { Product } from '@/lib/types';

export const metadata: Metadata = { title: 'Pieces' };

const FILTERS = {
  photo: { title: 'Pieces that need a photo', keep: (p: Product) => p.images.length === 0 },
  rate: { title: 'Pieces that need a rate', keep: (p: Product) => p.rate === null },
};

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ missing?: string }> }) {
  const { missing } = await searchParams;
  const filter = missing === 'photo' || missing === 'rate' ? FILTERS[missing] : null;
  const { products: all } = await apiGet<{ products: Product[] }>('/api/admin/products');
  const products = filter ? all.filter(filter.keep) : all;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl text-rani">{filter?.title ?? 'Pieces'}</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          Add a piece
        </Link>
      </div>
      {filter && (
        <Link href="/admin/products" className="mt-2 inline-block underline underline-offset-4">
          Show all pieces
        </Link>
      )}

      {products.length === 0 ? (
        <p className="mt-8">{filter ? 'None left to fill in.' : 'No pieces yet. Add the first one.'}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink/30">
                <th scope="col" className="py-2 pr-4 font-semibold">Piece</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Category</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Rate</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Photos</th>
                <th scope="col" className="py-2 font-semibold">On the site</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-ink/15">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 font-medium hover:underline">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageSrc(product.images[0].url, 100)} alt="" className="h-14 w-11 shrink-0 object-cover" />
                      ) : (
                        <span
                          className="cloth h-14 w-11 shrink-0"
                          style={{ backgroundColor: product.colors[0]?.hex ?? '#0b4f56' }}
                        />
                      )}
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{product.category?.name ?? 'None'}</td>
                  <td className={`py-2 pr-4 ${product.rate === null ? 'text-muted' : ''}`}>
                    {product.rate === null ? 'Not set' : formatRate(product.rate)}
                  </td>
                  <td className={`py-2 pr-4 ${product.images.length ? '' : 'text-muted'}`}>
                    {product.images.length || 'None'}
                  </td>
                  <td className="py-2">{product.active ? 'Showing' : 'Hidden'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
