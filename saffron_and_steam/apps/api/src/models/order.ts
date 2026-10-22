import { model, Schema, type InferSchemaType } from "mongoose";
import { LOCALES } from "@saffron/shared";
import { customerSchema, lineSchema, totalsSchema } from "./common";

const STATUSES = ["placed", "accepted", "preparing", "ready", "completed", "outForDelivery", "delivered", "cancelled"] as const;

const orderSchema = new Schema(
  {
    /** Human-friendly reference shown to the customer, e.g. "SO-1022-4821". */
    orderNumber: { type: String, required: true, unique: true },
    trackingTokenHash: { type: String, required: true },
    locale: { type: String, enum: LOCALES, required: true },
    type: { type: String, enum: ["pickup", "dineIn", "delivery"], required: true },
    /** "asap" or minutes after midnight, café time. */
    pickupTime: Schema.Types.Mixed,
    tableNumber: String,
    delivery: new Schema(
      {
        address: new Schema({ line1: String, line2: String, landmark: String, city: String, pincode: String }, { _id: false }),
        zoneName: String,
        fee: Number,
        etaMinutes: Number,
      },
      { _id: false },
    ),
    customer: { type: customerSchema, required: true },
    items: { type: [lineSchema], required: true },
    totals: { type: totalsSchema, required: true },
    payment: {
      type: new Schema(
        {
          method: { type: String, enum: ["online", "counter", "cod"], required: true },
          status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
          provider: String,
          paidAt: Date,
        },
        { _id: false },
      ),
      required: true,
    },
    status: { type: String, enum: STATUSES, default: "placed" },
    statusHistory: [new Schema({ status: { type: String, enum: STATUSES }, at: Date }, { _id: false })],
  },
  { timestamps: true },
);
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const OrderModel = model("Order", orderSchema);
