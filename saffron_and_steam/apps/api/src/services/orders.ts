import {
  computeTotals,
  getZonedNow,
  makeReference,
  orderFlow,
  demoStepIndex,
  quoteDelivery,
  toMinutes,
  type OrderRecord,
  type OrderStatus,
} from "@saffron/shared";
import type { HydratedDocument } from "mongoose";
import { env } from "../config/env";
import { HttpError, notFound } from "../lib/http-error";
import { isDuplicateKey, newToken, tokenMatches } from "../lib/tokens";
import { OrderModel, type OrderDoc } from "../models/order";
import type { OrderInput } from "../schemas";
import { loadMenu, loadSettings } from "./catalog";
import { priceOrReject, snapshot } from "./pricing";

/** Online orders still unpaid after this long are cancelled (PLAN.md 9.5). */
const UNPAID_CANCEL_MINUTES = 15;

type Order = HydratedDocument<OrderDoc>;

export async function createOrder(input: OrderInput): Promise<{ order: OrderRecord; token: string }> {
  const [menu, settings] = await Promise.all([loadMenu(), loadSettings()]);
  const now = getZonedNow(settings.timezone);

  // Dishes served at another meal are allowed: the kitchen cooks them when it starts.
  const priced = priceOrReject(input.lines, menu);
  const subtotal = priced.reduce((sum, l) => sum + l.lineTotal, 0);

  let delivery: OrderDoc["delivery"];
  if (input.type === "delivery") {
    const address = input.address!;
    const quote = quoteDelivery(address.pincode, settings);
    if (!quote.ok) throw new HttpError(409, "DELIVERY_UNAVAILABLE", "We don't deliver to this pincode", { reason: quote.reason });
    if (subtotal < quote.minOrder) {
      throw new HttpError(409, "BELOW_MINIMUM", "The order is below this area's minimum", { minOrder: quote.minOrder, subtotal });
    }
    delivery = { address, zoneName: quote.zoneName, fee: 0, etaMinutes: quote.etaMinutes };
  }

  let pickupTime: "asap" | number | undefined;
  if (input.type === "pickup") {
    pickupTime = input.pickupTime ?? "asap";
    if (typeof pickupTime === "number") {
      const ok =
        pickupTime % 15 === 0 &&
        pickupTime >= now.minutes + settings.pickupLeadMinutes &&
        pickupTime >= toMinutes(settings.openingHours.start) &&
        pickupTime <= toMinutes(settings.openingHours.end) - 15;
      if (!ok) throw new HttpError(409, "PICKUP_TIME_UNAVAILABLE", "Pick a later pickup time");
    }
  }

  const totals = computeTotals(subtotal, settings, delivery ? { pincode: delivery.address!.pincode! } : undefined);
  if (delivery) delivery.fee = totals.deliveryFee;

  const method = input.paymentMethod;
  const methodOk =
    method === "online" ||
    (method === "counter" && input.type !== "delivery") ||
    (method === "cod" && input.type === "delivery" && settings.delivery.codEnabled && totals.total <= settings.delivery.codMaxOrder);
  if (!methodOk) throw new HttpError(409, "PAYMENT_METHOD_UNAVAILABLE", `${method} isn't available for this order`);

  const { token, hash } = newToken();
  const at = new Date();
  // References are short and random, so retry the rare clash with an existing one.
  for (let attempt = 0; ; attempt++) {
    try {
      const doc = await OrderModel.create({
        orderNumber: makeReference("SO", now.isoDate),
        trackingTokenHash: hash,
        locale: input.locale,
        type: input.type,
        pickupTime,
        tableNumber: input.type === "dineIn" ? input.table : undefined,
        delivery,
        customer: input.customer,
        items: snapshot(priced),
        totals,
        payment: { method, status: "pending" },
        status: "placed",
        statusHistory: [{ status: "placed", at }],
      });
      return { order: toRecord(doc), token };
    } catch (err) {
      if (!isDuplicateKey(err) || attempt >= 4) throw err;
    }
  }
}

/** Opens an order from its tracking link. A wrong token looks exactly like a missing order. */
export async function getOrder(reference: string, token: unknown): Promise<OrderRecord> {
  const doc = await findWithToken(reference, token);
  if (env.DEMO_MODE) await advanceDemo(doc);
  return toRecord(doc);
}

/** Demo stand-in for Razorpay: marks an online order as paid. Calling it twice is harmless. */
export async function payOrderDemo(reference: string, token: unknown): Promise<OrderRecord> {
  const doc = await findWithToken(reference, token);
  if (doc.payment.method !== "online") throw new HttpError(409, "PAYMENT_METHOD_UNAVAILABLE", "This order is paid at the café or on delivery");
  if (doc.status === "cancelled") throw new HttpError(409, "ORDER_CANCELLED", "This order was cancelled");
  if (doc.payment.status !== "paid") {
    doc.payment.status = "paid";
    doc.payment.provider = "demo";
    doc.payment.paidAt = new Date();
    await doc.save();
  }
  return toRecord(doc);
}

async function findWithToken(reference: string, token: unknown): Promise<Order> {
  const doc = await OrderModel.findOne({ orderNumber: reference });
  if (!doc || !tokenMatches(token, doc.trackingTokenHash)) throw notFound("Order");
  return doc;
}

/**
 * Until staff move orders on from the admin board, the demo steps through the status
 * flow on a timer (shared DEMO_ORDER_FLOW), starting once an online order is paid.
 */
async function advanceDemo(doc: Order): Promise<void> {
  if (doc.status === "cancelled" || doc.status === "completed" || doc.status === "delivered") return;
  const placedAt = doc.get("createdAt") as Date;
  const unpaidOnline = doc.payment.method === "online" && doc.payment.status !== "paid";

  if (unpaidOnline) {
    if (Date.now() - placedAt.getTime() < UNPAID_CANCEL_MINUTES * 60_000) return;
    doc.status = "cancelled";
    doc.statusHistory.push({ status: "cancelled", at: new Date(placedAt.getTime() + UNPAID_CANCEL_MINUTES * 60_000) });
    await doc.save();
    return;
  }

  const start = (doc.payment.paidAt ?? placedAt).getTime();
  const flow = orderFlow(doc.type);
  const reached = demoStepIndex(doc.type, (Date.now() - start) / 60_000);
  const current = flow.findIndex(([status]) => status === doc.status);
  if (reached <= current) return;

  for (const [status, minutes] of flow.slice(current + 1, reached + 1)) {
    doc.statusHistory.push({ status, at: new Date(start + minutes * 60_000) });
  }
  doc.status = flow[reached][0];
  // Cash on delivery counts as paid once the rider hands the order over (PLAN.md 9.3).
  if (doc.status === "delivered" && doc.payment.method === "cod") doc.payment.status = "paid";
  await doc.save();
}

function toRecord(doc: Order): OrderRecord {
  const address = doc.delivery?.address;
  return {
    id: doc.orderNumber,
    createdAt: (doc.get("createdAt") as Date).toISOString(),
    locale: doc.locale,
    type: doc.type,
    pickupTime: doc.pickupTime as OrderRecord["pickupTime"],
    table: doc.tableNumber ?? undefined,
    address: address
      ? { line1: address.line1 ?? "", line2: address.line2 ?? "", landmark: address.landmark ?? "", city: address.city ?? "", pincode: address.pincode ?? "" }
      : undefined,
    customer: { name: doc.customer.name, phone: doc.customer.phone, email: doc.customer.email },
    lines: doc.items.map((l) => ({ slug: l.slug, qty: l.qty, variant: l.variant ?? undefined, addOns: l.addOns?.length ? l.addOns : undefined })),
    totals: { subtotal: doc.totals.subtotal, deliveryFee: doc.totals.deliveryFee, tax: doc.totals.tax, total: doc.totals.total },
    payment: { method: doc.payment.method, status: doc.payment.status === "paid" ? "paid" : "pending" },
    status: doc.status as OrderStatus,
  };
}
