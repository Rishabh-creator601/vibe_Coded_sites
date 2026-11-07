'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '@/lib/client-api';
import type { User } from '@/lib/types';

export const PHONE_HELP = 'M Creations uses this to reach you on WhatsApp about the pieces you ask about.';

/** Saves the logged-in user's phone number, then goes to `next` or stays and confirms. */
export function PhoneForm({ initial, next }: { initial?: string | null; next?: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState(initial ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const { user } = await api<{ user: User }>('/api/auth/me', { method: 'PATCH', body: { phone } });
      if (next) {
        router.replace(next);
      } else {
        setPhone(user.phone ?? '');
        setSaved(true);
        setBusy(false);
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-4">
      <label className="block">
        <span className="mb-1 block font-medium">WhatsApp number</span>
        <input
          className="field"
          type="tel"
          autoComplete="tel"
          required
          maxLength={24}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setSaved(false);
          }}
        />
        <span className="mt-1 block text-sm text-muted">{PHONE_HELP}</span>
      </label>
      {error && (
        <p role="alert" className="font-medium text-rani-deep">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait' : 'Save number'}
        </button>
        {saved && <p role="status">Number saved.</p>}
      </div>
    </form>
  );
}
