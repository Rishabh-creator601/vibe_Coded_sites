import { addDays, demoMenu, demoSettings, getZonedNow, reservationSlots } from "@saffron/shared";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { env } from "../src/config/env";
import { connectDb, disconnectDb } from "../src/db";
import { MessageModel, SubscriberModel } from "../src/models/inbox";
import { MenuItemModel } from "../src/models/menu";
import { OrderModel } from "../src/models/order";
import { ReservationModel, SlotCounterModel } from "../src/models/reservation";
import { seedCatalog } from "../src/seed/seed";
import { zonedToUtc } from "../src/services/reservations";

const app = createApp();
const api = () => request(app);

const customer = { name: "Asha Rao", phone: "+91 98765 43210", email: "Asha@Example.com" };
const chai = demoMenu.find((i) => i.slug === "masala-chai")!;
const pricey = [...demoMenu].sort((a, b) => b.price - a.price)[0];

beforeAll(async () => {
  expect(env.MONGODB_URI).toMatch(/_test$/);
  await connectDb(env.MONGODB_URI);
  await mongoose.connection.dropDatabase();
  await seedCatalog();
  await Promise.all([OrderModel.init(), ReservationModel.init(), MessageModel.init(), SubscriberModel.init()]);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDb();
});

describe("menu and settings", () => {
  it("lists all 61 dishes with categories", async () => {
    const res = await api().get("/api/v1/menu").expect(200);
    expect(res.body.items).toHaveLength(demoMenu.length);
    expect(res.body.categories.map((c: { slug: string }) => c.slug)).toContain("tea-coffee");
    expect(res.body.items[0]).not.toHaveProperty("_id");
  });

  it("filters by diet and searches in the visitor's language", async () => {
    const vegan = await api().get("/api/v1/menu?diet=vegan").expect(200);
    expect(vegan.body.items.length).toBeGreaterThan(0);
    expect(vegan.body.items.every((i: { diet: string }) => i.diet === "vegan")).toBe(true);

    const hindi = await api().get(`/api/v1/menu?locale=hi&q=${encodeURIComponent(chai.name.hi!)}`).expect(200);
    expect(hindi.body.items.map((i: { slug: string }) => i.slug)).toContain("masala-chai");
  });

  it("returns one dish, or 404", async () => {
    await api().get("/api/v1/menu/items/masala-chai").expect(200);
    const res = await api().get("/api/v1/menu/items/nope").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns public settings with the café's current status", async () => {
    const res = await api().get("/api/v1/settings/public").expect(200);
    expect(res.body.settings.cafeName).toBe("Saffron & Steam");
    expect(["meal", "between", "closed"]).toContain(res.body.status.kind);
  });

  it("quotes delivery by pincode", async () => {
    const ok = await api().post("/api/v1/delivery/quote").send({ pincode: "400054", subtotal: 10000 }).expect(200);
    expect(ok.body).toMatchObject({ ok: true, zoneName: "Zone B", meetsMinimum: false });
    const far = await api().post("/api/v1/delivery/quote").send({ pincode: "110001" }).expect(200);
    expect(far.body).toMatchObject({ ok: false, reason: "notCovered" });
  });
});

describe("orders", () => {
  const pickup = (extra: object = {}) => ({
    type: "pickup",
    pickupTime: "asap",
    customer,
    lines: [{ slug: "masala-chai", qty: 2 }],
    paymentMethod: "counter",
    ...extra,
  });

  it("prices the order on the server and hides the tracking token", async () => {
    const res = await api().post("/api/v1/orders").send(pickup()).expect(201);
    const subtotal = chai.price * 2;
    const tax = Math.round((subtotal * demoSettings.taxPercent) / 100);
    expect(res.body.order).toMatchObject({
      type: "pickup",
      status: "placed",
      totals: { subtotal, deliveryFee: 0, tax, total: subtotal + tax },
      customer: { phone: "9876543210", email: "asha@example.com" },
    });
    expect(res.body.order.id).toMatch(/^SO-\d{4}-\d{4}$/);
    expect(typeof res.body.token).toBe("string");

    const saved = await OrderModel.findOne({ orderNumber: res.body.order.id }).lean();
    expect(saved?.trackingTokenHash).not.toBe(res.body.token);
    expect(saved?.items[0].name.en).toBe(chai.name.en);
  });

  it("rejects a price sent from the browser", async () => {
    const res = await api()
      .post("/api/v1/orders")
      .send(pickup({ lines: [{ slug: "masala-chai", qty: 1, price: 1 }] }))
      .expect(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("rejects unknown and sold-out dishes and made-up options", async () => {
    const unknown = await api().post("/api/v1/orders").send(pickup({ lines: [{ slug: "unicorn-steak", qty: 1 }] })).expect(409);
    expect(unknown.body.error).toMatchObject({ code: "ITEM_UNAVAILABLE", details: { slug: "unicorn-steak" } });

    await MenuItemModel.updateOne({ slug: "masala-chai" }, { isAvailable: false });
    try {
      const soldOut = await api().post("/api/v1/orders").send(pickup()).expect(409);
      expect(soldOut.body.error.code).toBe("ITEM_UNAVAILABLE");
    } finally {
      await MenuItemModel.updateOne({ slug: "masala-chai" }, { isAvailable: true });
    }

    const option = await api().post("/api/v1/orders").send(pickup({ lines: [{ slug: "masala-chai", qty: 1, variant: 9 }] })).expect(400);
    expect(option.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("checks names, phones and emails, and requires a table for dine-in", async () => {
    const res = await api()
      .post("/api/v1/orders")
      .send({ type: "dineIn", customer: { name: "", phone: "12345", email: "nope" }, lines: [{ slug: "masala-chai", qty: 1 }], paymentMethod: "counter" })
      .expect(400);
    expect(res.body.error.details).toEqual({ "customer.name": "required", "customer.phone": "invalid", "customer.email": "invalid" });

    const noTable = await api().post("/api/v1/orders").send(pickup({ type: "dineIn", pickupTime: undefined })).expect(400);
    expect(noTable.body.error.details).toEqual({ table: "required" });
  });

  describe("delivery", () => {
    const address = { line1: "Flat 4, Sunrise", line2: "Hill Road", landmark: "", city: "Mumbai", pincode: "400054" };
    const delivery = (lines: object[], paymentMethod = "cod", pincode = "400054") => ({
      type: "delivery",
      address: { ...address, pincode },
      customer,
      lines,
      paymentMethod,
    });

    it("refuses pincodes outside every zone and orders below the zone minimum", async () => {
      const far = await api().post("/api/v1/orders").send(delivery([{ slug: "masala-chai", qty: 1 }], "cod", "110001")).expect(409);
      expect(far.body.error).toMatchObject({ code: "DELIVERY_UNAVAILABLE", details: { reason: "notCovered" } });
      const small = await api().post("/api/v1/orders").send(delivery([{ slug: "masala-chai", qty: 1 }])).expect(409);
      expect(small.body.error.code).toBe("BELOW_MINIMUM");
    });

    it("adds the zone fee below the free-delivery threshold, and none above it", async () => {
      const qty = Math.ceil(demoSettings.delivery.zones[1].minOrder / chai.price);
      const res = await api().post("/api/v1/orders").send(delivery([{ slug: "masala-chai", qty }])).expect(201);
      const subtotal = chai.price * qty;
      expect(subtotal).toBeLessThan(demoSettings.delivery.freeDeliveryAbove);
      expect(res.body.order.totals.deliveryFee).toBe(demoSettings.delivery.zones[1].fee);

      const big = await api().post("/api/v1/orders").send(delivery([{ slug: pricey.slug, qty: 5 }], "online")).expect(201);
      expect(big.body.order.totals.deliveryFee).toBe(0);
    });

    it("allows cash on delivery only up to the limit, and never pay-at-counter", async () => {
      const qty = Math.ceil(demoSettings.delivery.codMaxOrder / pricey.price) + 1;
      expect(qty).toBeLessThanOrEqual(20);
      const res = await api().post("/api/v1/orders").send(delivery([{ slug: pricey.slug, qty }])).expect(409);
      expect(res.body.error.code).toBe("PAYMENT_METHOD_UNAVAILABLE");
      const counter = await api().post("/api/v1/orders").send(delivery([{ slug: pricey.slug, qty: 3 }], "counter")).expect(409);
      expect(counter.body.error.code).toBe("PAYMENT_METHOD_UNAVAILABLE");
    });
  });

  it("opens an order only with its token", async () => {
    const { body } = await api().post("/api/v1/orders").send(pickup()).expect(201);
    await api().get(`/api/v1/orders/${body.order.id}`).expect(404);
    await api().get(`/api/v1/orders/${body.order.id}?token=wrong`).expect(404);
    const res = await api().get(`/api/v1/orders/${body.order.id}?token=${body.token}`).expect(200);
    expect(res.body.order.id).toBe(body.order.id);
  });

  it("moves the demo status along with time", async () => {
    const { body } = await api().post("/api/v1/orders").send(pickup()).expect(201);
    await OrderModel.collection.updateOne({ orderNumber: body.order.id }, { $set: { createdAt: new Date(Date.now() - 6 * 60_000) } });
    const res = await api().get(`/api/v1/orders/${body.order.id}?token=${body.token}`).expect(200);
    expect(res.body.order.status).toBe("ready");
    const saved = await OrderModel.findOne({ orderNumber: body.order.id }).lean();
    expect(saved?.statusHistory.map((h) => h.status)).toEqual(["placed", "accepted", "preparing", "ready"]);
  });

  it("holds unpaid online orders, takes the demo payment once, and cancels if never paid", async () => {
    const { body } = await api().post("/api/v1/orders").send(pickup({ paymentMethod: "online" })).expect(201);
    expect(body.order.payment).toEqual({ method: "online", status: "pending" });
    const paid = await api().post(`/api/v1/orders/${body.order.id}/demo-payment`).send({ token: body.token }).expect(200);
    expect(paid.body.order.payment.status).toBe("paid");
    await api().post(`/api/v1/orders/${body.order.id}/demo-payment`).send({ token: body.token }).expect(200);
    await api().post(`/api/v1/orders/${body.order.id}/demo-payment`).send({ token: "wrong" }).expect(404);

    const unpaid = await api().post("/api/v1/orders").send(pickup({ paymentMethod: "online" })).expect(201);
    await OrderModel.collection.updateOne({ orderNumber: unpaid.body.order.id }, { $set: { createdAt: new Date(Date.now() - 16 * 60_000) } });
    const res = await api().get(`/api/v1/orders/${unpaid.body.order.id}?token=${unpaid.body.token}`).expect(200);
    expect(res.body.order.status).toBe("cancelled");
    const late = await api().post(`/api/v1/orders/${unpaid.body.order.id}/demo-payment`).send({ token: unpaid.body.token }).expect(409);
    expect(late.body.error.code).toBe("ORDER_CANCELLED");
  });
});

describe("reservations", () => {
  const now = getZonedNow(demoSettings.timezone);
  const date = addDays(now.isoDate, 1);
  const slots = reservationSlots(demoSettings, "dinner", date);
  const booking = (extra: object = {}) => ({ date, period: "dinner", time: slots[1], party: 4, customer, ...extra });

  beforeEach(async () => {
    await Promise.all([ReservationModel.deleteMany({}), SlotCounterModel.deleteMany({})]);
  });

  it("books a table and opens it with the token", async () => {
    const { body } = await api().post("/api/v1/reservations").send(booking({ notes: "Window seat" })).expect(201);
    expect(body.booking).toMatchObject({ date, time: slots[1], party: 4, notes: "Window seat", preorderTotals: null, payment: { method: "atCafe" } });
    await api().get(`/api/v1/reservations/${body.booking.id}?token=nope`).expect(404);
    await api().get(`/api/v1/reservations/${body.booking.id}?token=${body.token}`).expect(200);
  });

  it("prices a pre-order and takes the demo payment", async () => {
    const { body } = await api()
      .post("/api/v1/reservations")
      .send(booking({ preorder: [{ slug: "masala-chai", qty: 3 }], paymentMethod: "online" }))
      .expect(201);
    expect(body.booking.preorderTotals.subtotal).toBe(chai.price * 3);
    const paid = await api().post(`/api/v1/reservations/${body.booking.id}/demo-payment`).send({ token: body.token }).expect(200);
    expect(paid.body.booking.payment).toEqual({ method: "online", status: "paid" });
  });

  it("rejects times outside the meal, past dates and parties over the limit", async () => {
    const offMeal = await api().post("/api/v1/reservations").send(booking({ time: 3 * 60 })).expect(409);
    expect(offMeal.body.error.code).toBe("SLOT_UNAVAILABLE");
    await api().post("/api/v1/reservations").send(booking({ date: addDays(now.isoDate, -1) })).expect(409);
    await api().post("/api/v1/reservations").send(booking({ date: addDays(now.isoDate, 60) })).expect(409);
    const big = await api().post("/api/v1/reservations").send(booking({ party: 11 })).expect(400);
    expect(big.body.error.details).toEqual({ party: "invalid" });
  });

  it("never overfills a slot, even when bookings arrive at the same moment", async () => {
    // 20 seats per slot: of five parties of 6 arriving together, only three fit.
    const results = await Promise.all(Array.from({ length: 5 }, () => api().post("/api/v1/reservations").send(booking({ party: 6 }))));
    const statuses = results.map((r) => r.status).sort();
    expect(statuses).toEqual([201, 201, 201, 409, 409]);
    expect(results.find((r) => r.status === 409)!.body.error).toMatchObject({ code: "SLOT_FULL", details: { coversLeft: 2 } });

    const { body } = await api().get(`/api/v1/reservations/availability?date=${date}&period=dinner&party=2`).expect(200);
    expect(body.slots.find((s: { time: number }) => s.time === slots[1])).toEqual({ time: slots[1], coversLeft: 2, available: true });
    expect(body.slots.find((s: { time: number }) => s.time === slots[0])).toMatchObject({ coversLeft: 20 });
  });

  it("stores the slot in UTC", () => {
    expect(zonedToUtc("2026-10-24", 19 * 60 + 30, "Asia/Kolkata").toISOString()).toBe("2026-10-24T14:00:00.000Z");
  });
});

describe("contact and newsletter", () => {
  it("saves a valid message and returns a reference", async () => {
    const res = await api()
      .post("/api/v1/contact")
      .send({ name: "Ravi", email: "ravi@example.com", phone: "", topic: "events", message: "Can we book the café for a birthday?" })
      .expect(201);
    expect(res.body.reference).toMatch(/^MSG-/);
    expect(await MessageModel.countDocuments({ reference: res.body.reference, topic: "events" })).toBe(1);
  });

  it("returns a code per field for the form to translate", async () => {
    const res = await api().post("/api/v1/contact").send({ name: " ", email: "x", phone: "123", topic: "general", message: "hi" }).expect(400);
    expect(res.body.error.details).toEqual({ name: "required", email: "invalid", phone: "invalid", message: "short" });
  });

  it("quietly drops messages from bots", async () => {
    const before = await MessageModel.countDocuments();
    await api().post("/api/v1/contact").send({ name: "Bot", email: "bot@example.com", topic: "general", message: "Buy cheap watches now", company: "Spam Inc" }).expect(201);
    expect(await MessageModel.countDocuments()).toBe(before);
  });

  it("subscribes an email once, however often it's sent", async () => {
    await api().post("/api/v1/newsletter").send({ email: "Fan@Example.com" }).expect(201);
    await api().post("/api/v1/newsletter").send({ email: "fan@example.com" }).expect(201);
    expect(await SubscriberModel.countDocuments({ email: "fan@example.com" })).toBe(1);
  });
});

describe("errors", () => {
  it("answers unknown routes and bad JSON with the standard error shape", async () => {
    const missing = await api().get("/api/v1/nothing-here").expect(404);
    expect(missing.body.error.code).toBe("NOT_FOUND");
    const bad = await api().post("/api/v1/orders").set("Content-Type", "application/json").send("{oops").expect(400);
    expect(bad.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("blocks MongoDB operators hidden in query strings", async () => {
    await api().get("/api/v1/orders/x?token[$ne]=1").expect(404);
  });
});
