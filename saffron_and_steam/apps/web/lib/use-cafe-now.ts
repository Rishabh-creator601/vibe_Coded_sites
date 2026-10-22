"use client";

import { useSyncExternalStore } from "react";
import { getZonedNow, type ZonedNow } from "@saffron/shared";

// One shared minute ticker for every live element on the page.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => listeners.forEach((l) => l()), 15_000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const currentMinute = () => Math.floor(Date.now() / 60_000);

/**
 * The café's wall-clock time, or null during server rendering and the first client
 * render. Cached pages never show a stale "Open now" because this runs in the browser.
 */
export function useCafeNow(timezone: string): ZonedNow | null {
  const minute = useSyncExternalStore(subscribe, currentMinute, () => null);
  return minute === null ? null : getZonedNow(timezone, new Date(minute * 60_000));
}
