// Orders and table bookings as the web app shows them. The API returns these shapes,
// and the browser-only demo (no API) saves the same shapes in localStorage.

import type { LineInput, OrderType, PaymentMethod, Totals } from "./orders";
import type { Cuisine, Locale, MealPeriodKey } from "./types";

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Address {
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  pincode: string;
}

/** PLAN.md 9.3. `cancelled` is only reachable from `placed` or `accepted`. */
export type OrderStatus = "placed" | "accepted" | "preparing" | "ready" | "completed" | "outForDelivery" | "delivered" | "cancelled";

export interface OrderRecord {
  id: string;
  createdAt: string;
  locale: Locale;
  type: OrderType;
  /** "asap" or minutes after midnight, for pickup orders. */
  pickupTime?: "asap" | number;
  table?: string;
  address?: Address;
  customer: Customer;
  lines: LineInput[];
  totals: Totals;
  payment: { method: PaymentMethod; status: "paid" | "pending" };
  /** Set by the API. The browser-only demo works the status out from the time instead. */
  status?: OrderStatus;
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

/**
 * Status steps for each kind of order, with the minute after placing at which the demo
 * moves to each one (PLAN.md 9.3). Staff will move orders on from the admin board later.
 */
export const DEMO_ORDER_FLOW: Record<"counter" | "delivery", [OrderStatus, number][]> = {
  counter: [["placed", 0], ["accepted", 1], ["preparing", 2], ["ready", 5], ["completed", 7]],
  delivery: [["placed", 0], ["accepted", 1], ["preparing", 2], ["ready", 5], ["outForDelivery", 6], ["delivered", 9]],
};

export function orderFlow(type: OrderType): [OrderStatus, number][] {
  return DEMO_ORDER_FLOW[type === "delivery" ? "delivery" : "counter"];
}

/** The step the demo has reached `elapsedMinutes` after the order was placed. */
export function demoStepIndex(type: OrderType, elapsedMinutes: number): number {
  return orderFlow(type).reduce((idx, [, at], i) => (elapsedMinutes >= at ? i : idx), 0);
}
