'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/client-api';

export function LogoutButton({ className = 'btn btn-quiet' }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logOut() {
    setBusy(true);
    try {
      await api('/api/auth/logout', { method: 'POST' });
      router.replace('/');
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={logOut} disabled={busy} className={className}>
      Log out
    </button>
  );
}
