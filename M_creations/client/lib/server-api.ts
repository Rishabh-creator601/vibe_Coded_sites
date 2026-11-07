import { cookies } from 'next/headers';
import type { User } from './types';

const API_URL = process.env.API_URL || 'http://localhost:5100';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/** Fetches from Express during server rendering, passing on the visitor's login. */
export async function apiGet<T>(path: string): Promise<T> {
  const cookie = (await cookies()).toString();
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    headers: cookie ? { cookie } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data?.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return (await apiGet<{ user: User }>('/api/auth/me')).user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}
