"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BookingDraft, BookingRecord, OrderRecord } from "@saffron/shared";

export type { BookingDraft, BookingRecord, Customer, DietPreference, OrderRecord } from "@saffron/shared";

// The booking draft (between the form and the review page) always lives here. Orders
// and bookings are kept here too when the site runs without the API (lib/api.ts).

interface RecordsState {
  orders: Record<string, OrderRecord>;
  bookings: Record<string, BookingRecord>;
  draft: BookingDraft | null;
  saveOrder: (o: OrderRecord) => void;
  saveBooking: (b: BookingRecord) => void;
  setDraft: (d: BookingDraft | null) => void;
}

export const useRecords = create<RecordsState>()(
  persist(
    (set) => ({
      orders: {},
      bookings: {},
      draft: null,
      saveOrder: (o) => set((s) => ({ orders: { ...s.orders, [o.id]: o } })),
      saveBooking: (b) => set((s) => ({ bookings: { ...s.bookings, [b.id]: b } })),
      setDraft: (draft) => set({ draft }),
    }),
    { name: "saffron-records", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
