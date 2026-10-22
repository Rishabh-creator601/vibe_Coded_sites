import { Schema } from "mongoose";

/** { en, hi, bn, mr, te } text. Only English is required; the rest fall back to it. */
export const localizedSchema = new Schema(
  { en: { type: String, required: true }, hi: String, bn: String, mr: String, te: String },
  { _id: false },
);

export const customerSchema = new Schema(
  { name: { type: String, required: true }, phone: { type: String, required: true }, email: { type: String, required: true } },
  { _id: false },
);

/** A dish in an order or pre-order: what was chosen, plus the name and prices at that moment. */
export const lineSchema = new Schema(
  {
    slug: { type: String, required: true },
    name: { type: localizedSchema, required: true },
    qty: { type: Number, required: true },
    variant: Number,
    addOns: { type: [Number], default: undefined },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

export const totalsSchema = new Schema(
  {
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);
