'use client';

import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { api } from '@/lib/client-api';
import { imageSrc } from '@/lib/format';
import type { Category, Product, ProductColor, ProductImage } from '@/lib/types';

const MAX_PHOTOS = 8;

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category?.id ?? '');
  const [rate, setRate] = useState(product?.rate?.toString() ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [colors, setColors] = useState<ProductColor[]>(product?.colors ?? []);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [active, setActive] = useState(product?.active ?? true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const parents = categories.filter((c) => !c.parent);
  const childrenOf = (id: string) => categories.filter((c) => c.parent === id);

  function updateColor(index: number, change: Partial<ProductColor>) {
    setColors((list) => list.map((color, i) => (i === index ? { ...color, ...change } : color)));
  }

  async function onPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS - images.length);
    event.target.value = '';
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const form = new FormData();
        form.append('image', file);
        const { image } = await api<{ image: ProductImage }>('/api/admin/uploads', { method: 'POST', body: form });
        setImages((list) => [...list, image]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function makeMain(index: number) {
    setImages((list) => [list[index], ...list.filter((_, i) => i !== index)]);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const body = {
      name,
      category,
      description,
      rate: rate === '' ? null : Number(rate),
      colors,
      images,
      active,
    };
    try {
      await api(product ? `/api/admin/products/${product.id}` : '/api/admin/products', {
        method: product ? 'PUT' : 'POST',
        body,
      });
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!product) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-2xl space-y-6">
      <label className="block">
        <span className="mb-1 block font-medium">Name</span>
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-medium">Category</span>
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="" disabled>
              Choose a category
            </option>
            {parents.map((parent) =>
              childrenOf(parent.id).length ? (
                <optgroup key={parent.id} label={parent.name}>
                  {childrenOf(parent.id).map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              )
            )}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-medium">Rate (₹)</span>
          <input
            className="field"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            aria-describedby="rate-help"
          />
          <span id="rate-help" className="mt-1 block text-sm text-muted">
            Leave empty to show “Rate coming soon”.
          </span>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block font-medium">Description</span>
        <textarea
          className="field"
          rows={4}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <fieldset>
        <legend className="font-medium">Colours</legend>
        <p className="text-sm text-muted">Until there is a photo, the first colour is used for the cloth on the site.</p>
        <ul className="mt-2 space-y-2">
          {colors.map((color, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                type="color"
                aria-label={`Colour ${index + 1}`}
                value={color.hex}
                onChange={(e) => updateColor(index, { hex: e.target.value })}
                className="h-11 w-14 shrink-0 cursor-pointer rounded border border-[#b89aae] bg-white p-1"
              />
              <input
                className="field"
                aria-label={`Name of colour ${index + 1}`}
                placeholder="Colour name, like Rani pink"
                value={color.name}
                required
                maxLength={40}
                onChange={(e) => updateColor(index, { name: e.target.value })}
              />
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => setColors((list) => list.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-quiet mt-2"
          onClick={() => setColors((list) => [...list, { name: '', hex: '#b5125f' }])}
        >
          Add a colour
        </button>
      </fieldset>

      <fieldset>
        <legend className="font-medium">Photos</legend>
        <p className="text-sm text-muted">JPG, PNG or WebP, under 5 MB each, up to {MAX_PHOTOS} photos.</p>
        {images.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-4">
            {images.map((image, index) => (
              <li key={image.url} className="w-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(image.url, 300)} alt={`Photo ${index + 1}`} className="aspect-[4/5] w-full object-cover" />
                <div className="mt-1 flex flex-col items-start text-sm">
                  {index === 0 ? (
                    <span className="py-1 font-semibold">Main photo</span>
                  ) : (
                    <button type="button" className="cursor-pointer py-1 underline" onClick={() => makeMain(index)}>
                      Make main photo
                    </button>
                  )}
                  <button
                    type="button"
                    className="cursor-pointer py-1 underline"
                    onClick={() => setImages((list) => list.filter((_, i) => i !== index))}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {images.length < MAX_PHOTOS && (
          <label className="btn btn-quiet mt-3 focus-within:outline-3 focus-within:outline-ink">
            {uploading ? 'Uploading' : 'Upload photos'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading}
              onChange={onPhotos}
              className="sr-only"
            />
          </label>
        )}
      </fieldset>

      <label className="flex items-center gap-2">
        <input type="checkbox" className="size-5" checked={active} onChange={(e) => setActive(e.target.checked)} />
        <span className="font-medium">Show this piece on the site</span>
      </label>

      {error && (
        <p role="alert" className="font-medium text-rani-deep">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-ink/20 pt-5">
        <button className="btn btn-primary" disabled={busy || uploading}>
          {product ? 'Save changes' : 'Add piece'}
        </button>
        {product &&
          (confirmDelete ? (
            <>
              <button type="button" className="btn bg-ink text-white" disabled={busy} onClick={onDelete}>
                Yes, delete this piece
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => setConfirmDelete(false)}>
                Keep it
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-quiet" onClick={() => setConfirmDelete(true)}>
              Delete piece
            </button>
          ))}
      </div>
    </form>
  );
}
