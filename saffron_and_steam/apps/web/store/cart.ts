"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartLine {
  /** slug + chosen options, so the same dish with different options gets its own line. */
  key: string;
  slug: string;
  qty: number;
  variant?: number;
  addOns?: number[];
  notes?: string;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (slug: string, opts?: { variant?: number; addOns?: number[] }) => void;
  setQty: (key: string, qty: number) => void;
  open: () => void;
  close: () => void;
  clear: () => void;
}

function lineKey(slug: string, variant?: number, addOns: number[] = []) {
  return [slug, variant ?? 0, ...[...addOns].sort()].join(":");
}

// Only item IDs, quantities and options are kept here. Prices are always worked out
// again on the server at checkout (PLAN.md section 5).
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (slug, opts = {}) =>
        set((s) => {
          const key = lineKey(slug, opts.variant, opts.addOns);
          const existing = s.lines.find((l) => l.key === key);
          return {
            lines: existing
              ? s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + 1, 20) } : l))
              : [...s.lines, { key, slug, qty: 1, variant: opts.variant, addOns: opts.addOns }],
          };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => l.key !== key) : s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 20) } : l)),
        })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "saffron-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      // Rehydrated after mount (see CartHydration) so server and client HTML match.
      skipHydration: true,
    },
  ),
);

export function cartCount(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty, 0);
}
