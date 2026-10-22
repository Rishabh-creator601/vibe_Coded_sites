"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useCart } from "@/store/cart";
import { useRecords } from "@/store/records";

// `persist` only exists in the browser; while pre-rendering nothing is loaded yet.
function subscribe(onChange: () => void) {
  const unsubCart = useCart.persist?.onFinishHydration(onChange);
  const unsubRecords = useRecords.persist?.onFinishHydration(onChange);
  return () => {
    unsubCart?.();
    unsubRecords?.();
  };
}
const loaded = () => !!useCart.persist?.hasHydrated() && !!useRecords.persist?.hasHydrated();

/**
 * True once the cart and saved orders/bookings have been read from localStorage.
 * Always false during hydration, so the first client render matches the server HTML
 * even when another part of the page loaded the stores first.
 */
export function useStoresHydrated() {
  return useSyncExternalStore(subscribe, loaded, () => false);
}

/** Mounted once in the layout: loads the stores after the first render. */
export function StoreHydration() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void useRecords.persist.rehydrate();
  }, []);
  return null;
}
