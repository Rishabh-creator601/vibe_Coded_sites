import { model, Schema, type InferSchemaType } from "mongoose";
import { CUISINES, LOCALES } from "@saffron/shared";
import { customerSchema, lineSchema, totalsSchema } from "./common";

const reservationSchema = new Schema(
  {
    /** e.g. "SB-1024-1932". */
    reference: { type: String, required: true, unique: true },
    trackingTokenHash: { type: String, required: true },
    locale: { type: String, enum: LOCALES, required: true },
    /** Café-local day and time; `slotStart` is the same moment in UTC. */
    date: { type: String, required: true },
    period: { type: String, enum: ["breakfast", "lunch", "dinner"], required: true },
    time: { type: Number, required: true },
    slotStart: { type: Date, required: true },
    partySize: { type: Number, required: true, min: 1 },
    cuisines: [{ type: String, enum: CUISINES }],
    diet: { type: String, enum: ["any", "veg", "vegan"], default: "any" },
    preorder: { type: [lineSchema], default: [] },
    preorderTotals: totalsSchema,
    customer: { type: customerSchema, required: true },
    notes: { type: String, default: "" },
    payment: {
      type: new Schema(
        {
          method: { type: String, enum: ["online", "atCafe"], required: true },
          status: { type: String, enum: ["pending", "paid"], default: "pending" },
          paidAt: Date,
        },
        { _id: false },
      ),
      required: true,
    },
    status: { type: String, enum: ["pending", "confirmed", "seated", "completed", "cancelled", "noShow"], default: "confirmed" },
  },
  { timestamps: true },
);
reservationSchema.index({ slotStart: 1, status: 1 });

/**
 * Seats taken per slot, keyed "2026-10-24T19:30". Bookings add to it with one
 * conditional $inc, so two people can't both take the last seats (PLAN.md 9.4).
 */
const slotCounterSchema = new Schema({
  _id: { type: String, required: true },
  covers: { type: Number, default: 0 },
});

export type ReservationDoc = InferSchemaType<typeof reservationSchema>;
export const ReservationModel = model("Reservation", reservationSchema);
export const SlotCounterModel = model("SlotCounter", slotCounterSchema);
