import {
  addDays,
  computeTotals,
  getZonedNow,
  makeReference,
  reservationSlots,
  type BookingRecord,
  type MealPeriodKey,
} from "@saffron/shared";
import { trusted, type HydratedDocument } from "mongoose";
import { HttpError, notFound } from "../lib/http-error";
import { isDuplicateKey, newToken, tokenMatches } from "../lib/tokens";
import { ReservationModel, SlotCounterModel, type ReservationDoc } from "../models/reservation";
import type { ReservationInput } from "../schemas";
import { loadMenu, loadSettings } from "./catalog";
import { priceOrReject, snapshot } from "./pricing";

type Reservation = HydratedDocument<ReservationDoc>;

const hhmm = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const slotKey = (date: string, time: number) => `${date}T${hhmm(time)}`;

/** The UTC moment of a café-local date and time (e.g. 19:30 in Asia/Kolkata). */
export function zonedToUtc(isoDate: string, minutes: number, timezone: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  const seen = getZonedNow(timezone, new Date(guess));
  const [sy, sm, sd] = seen.isoDate.split("-").map(Number);
  const offset = Date.UTC(sy, sm - 1, sd, 0, seen.minutes) - guess;
  return new Date(guess - offset);
}

export interface SlotAvailability {
  time: number;
  coversLeft: number;
  available: boolean;
}

/** Free tables for one meal on one day (GET /reservations/availability). */
export async function getAvailability(date: string, period: MealPeriodKey, party: number): Promise<SlotAvailability[]> {
  const settings = await loadSettings();
  const now = getZonedNow(settings.timezone);
  if (date < now.isoDate || date > addDays(now.isoDate, settings.reservation.bookingWindowDays)) return [];
  const times = reservationSlots(settings, period, date, now);
  const counters = await SlotCounterModel.find({ _id: trusted({ $in: times.map((t) => slotKey(date, t)) }) }).lean();
  const taken = new Map(counters.map((c) => [c._id, c.covers ?? 0]));
  const max = settings.reservation.maxCoversPerSlot;
  return times.map((time) => {
    const coversLeft = Math.max(0, max - (taken.get(slotKey(date, time)) ?? 0));
    return { time, coversLeft, available: party <= settings.reservation.maxPartySize && coversLeft >= party };
  });
}

export async function createReservation(input: ReservationInput): Promise<{ booking: BookingRecord; token: string }> {
  const [menu, settings] = await Promise.all([loadMenu(), loadSettings()]);
  const now = getZonedNow(settings.timezone);
  const rules = settings.reservation;

  if (input.party > rules.maxPartySize) throw new HttpError(400, "VALIDATION_FAILED", "Party too large", { party: "invalid" });
  const inWindow = input.date >= now.isoDate && input.date <= addDays(now.isoDate, rules.bookingWindowDays);
  if (!inWindow || !reservationSlots(settings, input.period, input.date, now).includes(input.time)) {
    throw new HttpError(409, "SLOT_UNAVAILABLE", "That time can't be booked");
  }

  const priced = priceOrReject(input.preorder, menu);
  const subtotal = priced.reduce((sum, l) => sum + l.lineTotal, 0);
  const preorderTotals = subtotal > 0 ? computeTotals(subtotal, settings) : undefined;

  const key = slotKey(input.date, input.time);
  await takeCovers(key, input.party, rules.maxCoversPerSlot);

  const { token, hash } = newToken();
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        const doc = await ReservationModel.create({
          reference: makeReference("SB", input.date),
          trackingTokenHash: hash,
          locale: input.locale,
          date: input.date,
          period: input.period,
          time: input.time,
          slotStart: zonedToUtc(input.date, input.time, settings.timezone),
          partySize: input.party,
          cuisines: input.cuisines,
          diet: input.diet,
          preorder: snapshot(priced),
          preorderTotals,
          customer: input.customer,
          notes: input.notes,
          // Online payment only makes sense when there's a pre-order to pay for.
          payment: { method: preorderTotals ? input.paymentMethod : "atCafe", status: "pending" },
          status: "confirmed",
        });
        return { booking: toRecord(doc), token };
      } catch (err) {
        if (!isDuplicateKey(err) || attempt >= 4) throw err;
      }
    }
  } catch (err) {
    await SlotCounterModel.updateOne({ _id: key }, { $inc: { covers: -input.party } });
    throw err;
  }
}

/**
 * Adds the party to the slot's seat count only if they still fit. The check and the
 * update are one MongoDB operation, so concurrent bookings can't overfill a slot.
 */
async function takeCovers(key: string, party: number, max: number): Promise<void> {
  try {
    await SlotCounterModel.updateOne({ _id: key }, { $setOnInsert: { covers: 0 } }, { upsert: true });
  } catch (err) {
    // Two first bookings for the same slot raced to create the counter; it exists now.
    if (!isDuplicateKey(err)) throw err;
  }
  const res = await SlotCounterModel.updateOne({ _id: key, covers: trusted({ $lte: max - party }) }, { $inc: { covers: party } });
  if (res.modifiedCount === 1) return;
  const counter = await SlotCounterModel.findById(key).lean();
  throw new HttpError(409, "SLOT_FULL", "Not enough free seats at that time", { coversLeft: Math.max(0, max - (counter?.covers ?? 0)) });
}

export async function getReservation(reference: string, token: unknown): Promise<BookingRecord> {
  return toRecord(await findWithToken(reference, token));
}

/** Demo stand-in for Razorpay: marks a pre-order as paid. Calling it twice is harmless. */
export async function payReservationDemo(reference: string, token: unknown): Promise<BookingRecord> {
  const doc = await findWithToken(reference, token);
  if (doc.payment.method !== "online") throw new HttpError(409, "PAYMENT_METHOD_UNAVAILABLE", "This pre-order is paid at the café");
  if (doc.payment.status !== "paid") {
    doc.payment.status = "paid";
    doc.payment.paidAt = new Date();
    await doc.save();
  }
  return toRecord(doc);
}

async function findWithToken(reference: string, token: unknown): Promise<Reservation> {
  const doc = await ReservationModel.findOne({ reference });
  if (!doc || !tokenMatches(token, doc.trackingTokenHash)) throw notFound("Booking");
  return doc;
}

function toRecord(doc: Reservation): BookingRecord {
  const t = doc.preorderTotals;
  return {
    id: doc.reference,
    createdAt: (doc.get("createdAt") as Date).toISOString(),
    date: doc.date,
    period: doc.period,
    time: doc.time,
    party: doc.partySize,
    cuisines: doc.cuisines,
    diet: doc.diet,
    preorder: doc.preorder.map((l) => ({ slug: l.slug, qty: l.qty, variant: l.variant ?? undefined, addOns: l.addOns?.length ? l.addOns : undefined })),
    customer: { name: doc.customer.name, phone: doc.customer.phone, email: doc.customer.email },
    notes: doc.notes,
    preorderTotals: t ? { subtotal: t.subtotal, deliveryFee: t.deliveryFee, tax: t.tax, total: t.total } : null,
    payment: { method: doc.payment.method, status: doc.payment.status },
  };
}
