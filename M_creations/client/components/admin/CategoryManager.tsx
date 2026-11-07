'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '@/lib/client-api';
import type { Category } from '@/lib/types';

function CategoryRow({
  category,
  onError,
  run,
}: {
  category: Category;
  onError: (message: string) => void;
  run: (action: () => Promise<unknown>) => Promise<boolean>;
}) {
  const [name, setName] = useState(category.name);
  const [editing, setEditing] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    const done = await run(() => api(`/api/admin/categories/${category.id}`, { method: 'PUT', body: { name } }));
    if (done) setEditing(false);
  }

  if (editing) {
    return (
      <form onSubmit={save} className="flex flex-wrap items-center gap-2 py-2">
        <input
          className="field max-w-xs"
          aria-label={`New name for ${category.name}`}
          value={name}
          required
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary">Save name</button>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            setName(category.name);
            setEditing(false);
          }}
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
      <span className="font-medium">{category.name}</span>
      <span className="text-sm text-muted">
        {category.count} {category.count === 1 ? 'piece' : 'pieces'}
      </span>
      <span className="ml-auto flex gap-4">
        <button type="button" className="cursor-pointer underline" onClick={() => { onError(''); setEditing(true); }}>
          Rename
        </button>
        <button
          type="button"
          className="cursor-pointer underline"
          onClick={() => run(() => api(`/api/admin/categories/${category.id}`, { method: 'DELETE' }))}
        >
          Delete
        </button>
      </span>
    </div>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [parent, setParent] = useState('');
  const [error, setError] = useState('');

  const parents = categories.filter((c) => !c.parent);

  async function run(action: () => Promise<unknown>) {
    setError('');
    try {
      await action();
      router.refresh();
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }

  async function add(event: FormEvent) {
    event.preventDefault();
    const done = await run(() =>
      api('/api/admin/categories', { method: 'POST', body: { name, parent: parent || null } })
    );
    if (done) setName('');
  }

  return (
    <div className="mt-6 max-w-2xl">
      {error && (
        <p role="alert" className="mb-4 font-medium text-rani-deep">
          {error}
        </p>
      )}
      <ul className="divide-y divide-ink/15 border-y border-ink/15">
        {parents.map((top) => (
          <li key={top.id}>
            <CategoryRow category={top} onError={setError} run={run} />
            {categories.some((c) => c.parent === top.id) && (
              <ul className="mb-2 ml-6 divide-y divide-ink/10 border-l-2 border-rani pl-4">
                {categories
                  .filter((c) => c.parent === top.id)
                  .map((child) => (
                    <li key={child.id}>
                      <CategoryRow category={child} onError={setError} run={run} />
                    </li>
                  ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-2xl">Add a category</h2>
      <form onSubmit={add} className="mt-3 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="mb-1 block font-medium">Name</span>
          <input className="field" value={name} required maxLength={60} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block font-medium">Place it under</span>
          <select className="field" value={parent} onChange={(e) => setParent(e.target.value)}>
            <option value="">Nothing (top level)</option>
            {parents.map((top) => (
              <option key={top.id} value={top.id}>
                {top.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary">Add category</button>
      </form>
    </div>
  );
}
