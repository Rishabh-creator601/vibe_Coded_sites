"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Cuisine, LineInput, Locale, MealPeriodKey, OrderType, PaymentMethod, Totals } from "@saffron/shared";

// Demo stand-in for the API: orders and bookings are kept in this browser only.
// Phase 4 replaces these with POST /orders and POST /reservations.

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  locale: Locale;
  type: OrderType;
  /** "asap" or minutes after midnight, for pickup orders. */
  pickupTime?: "asap" | number;
  table?: string;
  address?: { line1: string; line2: string; landmark: string; city: string; pincode: string };
  customer: Customer;
  lines: LineInput[];
  totals: Totals;
  payment: { method: PaymentMethod; status: "paid" | "pending" };
}

export type DietPreference = "any" | "veg" | "vegan";

export interface BookingDraft {
  date: string;
  period: MealPeriodKey;
  /** Minutes after midnight. */
  time: number;
  party: number;
  cuisines: Cuisine[];
  diet: DietPreference;
  preorder: LineInput[];
  customer: Customer;
  notes: string;
}

export interface BookingRecord extends BookingDraft {
  id: string;
  createdAt: string;
  preorderTotals: Totals | null;
  payment: { method: "online" | "atCafe"; status: "paid" | "pending" };
}

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
