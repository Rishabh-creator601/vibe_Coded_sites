'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api } from '@/lib/client-api';
import { afterLogin } from '@/lib/format';
import type { User } from '@/lib/types';
import { PHONE_HELP } from './PhoneForm';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleId = {
  initialize(options: { client_id: string; callback: (response: { credential: string }) => void }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

function GoogleButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const holder = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  callback.current = onCredential;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const render = () => {
      if (!window.google || !holder.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => callback.current(response.credential),
      });
      window.google.accounts.id.renderButton(holder.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 320,
      });
    };
    if (window.google) return render();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, []);

  return <div ref={holder} className="min-h-11" />;
}

export function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  async function finish(request: Promise<{ user: User }>) {
    setBusy(true);
    setError('');
    try {
      const { user } = await request;
      router.replace(afterLogin(user, next));
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    finish(api<{ user: User }>(`/api/auth/${isLogin ? 'login' : 'register'}`, { method: 'POST', body }));
  }

  const otherHref = `${isLogin ? '/register' : '/login'}${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-5xl text-rani">{isLogin ? 'Log in' : 'Create an account'}</h1>

      {GOOGLE_CLIENT_ID && (
        <div className="mt-6">
          <GoogleButton
            onCredential={(credential) =>
              finish(api<{ user: User }>('/api/auth/google', { method: 'POST', body: { credential } }))
            }
          />
          <p className="mt-5 border-t border-ink/20 pt-4 text-sm text-muted">Or use your email</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {!isLogin && (
          <label className="block">
            <span className="mb-1 block font-medium">Your name</span>
            <input className="field" name="name" autoComplete="name" required maxLength={80} />
          </label>
        )}
        <label className="block">
          <span className="mb-1 block font-medium">Email</span>
          <input className="field" name="email" type="email" autoComplete="email" required />
        </label>
        {!isLogin && (
          <label className="block">
            <span className="mb-1 block font-medium">WhatsApp number</span>
            <input className="field" name="phone" type="tel" autoComplete="tel" required maxLength={24} />
            <span className="mt-1 block text-sm text-muted">{PHONE_HELP}</span>
          </label>
        )}
        <label className="block">
          <span className="mb-1 block font-medium">Password</span>
          <input
            className="field"
            name="password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            minLength={isLogin ? undefined : 8}
            maxLength={72}
          />
          {!isLogin && <span className="mt-1 block text-sm text-muted">At least 8 characters</span>}
        </label>
        {error && (
          <p role="alert" className="font-medium text-rani-deep">
            {error}
          </p>
        )}
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? 'Please wait' : isLogin ? 'Log in' : 'Create account'}
        </button>
      </form>

      <p className="mt-5">
        {isLogin ? 'New to M Creations?' : 'Already have an account?'}{' '}
        <Link href={otherHref} className="font-semibold underline underline-offset-4">
          {isLogin ? 'Create an account' : 'Log in'}
        </Link>
      </p>
    </div>
  );
}
