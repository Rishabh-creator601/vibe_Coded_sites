import type { Content } from './types';

const API_URL = process.env.API_URL || 'http://127.0.0.1:4000';

/** Server-side only. Uncached, because the bag count changes with every reservation. */
export async function getContent(): Promise<Content> {
  const response = await fetch(`${API_URL}/api/content`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Content API answered ${response.status}`);
  return response.json();
}
