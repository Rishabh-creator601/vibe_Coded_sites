'use client';

import { useSyncExternalStore } from 'react';
import { MODE_COOKIE } from './themes';

export type Mode = 'light' | 'dark';

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const read = (): Mode => (document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light');

export const useMode = () => useSyncExternalStore(subscribe, read, () => 'light' as Mode);

const apply = (mode: Mode) => {
  document.documentElement.dataset.mode = mode;
  document.cookie = `${MODE_COOKIE}=${mode}; path=/; max-age=31536000; samesite=lax`;
  listeners.forEach((listener) => listener());
};

/** Switches mode, spreading the new palette in a circle from the point (x, y) where supported. */
export function setMode(mode: Mode, x: number, y: number) {
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !document.startViewTransition) {
    apply(mode);
    return;
  }
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(() => apply(mode)).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 520, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}
