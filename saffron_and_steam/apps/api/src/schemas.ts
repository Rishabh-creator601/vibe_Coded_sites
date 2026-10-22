import { z } from "zod";
import { CUISINES, isEmail, LOCALES, normalisePhone } from "@saffron/shared";
import { HttpError } from "./lib/http-error";

// Request bodies. Objects are strict, so a body carrying extra fields (a tampered
// `price`, say) is rejected instead of silently ignored. Issue messages are short codes
// ("required", "invalid", "short") that the web app turns into translated text.

const required = (max: number) => z.string("required").trim().min(1, "required").max(max, "invalid");

const phone = z
  .string("required")
  .trim()
  .transform((value, ctx) => {
    const clean = normalisePhone(value);
    if (!clean) ctx.addIssue({ code: "custom", message: value ? "invalid" : "required" });
    return clean ?? "";
  });

const email = z
  .string("required")
  .trim()
  .max(120, "invalid")
  .refine((v) => isEmail(v), "invalid")
  .transform((v) => v.toLowerCase());

const customer = z.strictObject({ name: required(80), phone, email });

const line = z.strictObject({
  slug: z.string().max(80),
  qty: z.int().min(1).max(20),
  variant: z.int().min(0).optional(),
  addOns: z.array(z.int().min(0)).max(10).optional(),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "invalid");

export const orderInput = z
  .strictObject({
    locale: z.enum(LOCALES).default("en"),
    type: z.enum(["pickup", "dineIn", "delivery"]),
    pickupTime: z.union([z.literal("asap"), z.int().min(0).max(1439)]).optional(),
    table: z.string().trim().regex(/^\d{1,3}$/, "invalid").optional(),
    address: z
      .strictObject({
        line1: required(120),
        line2: required(120),
        landmark: z.string().trim().max(120).default(""),
        city: z.string().trim().max(60).default(""),
        pincode: z.string().trim().regex(/^\d{6}$/, "invalid"),
      })
      .optional(),
    customer,
    lines: z.array(line).min(1, "required").max(30),
    paymentMethod: z.enum(["online", "counter", "cod"]),
  })
  .superRefine((o, ctx) => {
    if (o.type === "dineIn" && !o.table) ctx.addIssue({ code: "custom", path: ["table"], message: "required" });
    if (o.type === "delivery" && !o.address) ctx.addIssue({ code: "custom", path: ["address"], message: "required" });
  });
export type OrderInput = z.infer<typeof orderInput>;

export const reservationInput = z.strictObject({
  locale: z.enum(LOCALES).default("en"),
  date: isoDate,
  period: z.enum(["breakfast", "lunch", "dinner"]),
  time: z.int().min(0).max(1439),
  party: z.int().min(1),
  cuisines: z.array(z.enum(CUISINES)).max(CUISINES.length).default([]),
  diet: z.enum(["any", "veg", "vegan"]).default("any"),
  preorder: z.array(line).max(30).default([]),
  customer,
  notes: z.string().trim().max(500, "invalid").default(""),
  paymentMethod: z.enum(["online", "atCafe"]).default("atCafe"),
});
export type ReservationInput = z.infer<typeof reservationInput>;

export const availabilityQuery = z.object({
  date: isoDate,
  period: z.enum(["breakfast", "lunch", "dinner"]),
  party: z.coerce.number().int().min(1).default(2),
});

export const contactInput = z.strictObject({
  name: required(80),
  email,
  phone: z
    .string()
    .trim()
    .default("")
    .transform((value, ctx) => {
      if (!value) return null;
      const clean = normalisePhone(value);
      if (!clean) ctx.addIssue({ code: "custom", message: "invalid" });
      return clean;
    }),
  topic: z.enum(["general", "booking", "order", "events", "feedback"]).catch("general"),
  message: z.string("required").trim().min(10, "short").max(2000, "invalid"),
  /** Honeypot: hidden from people, filled in by bots. */
  company: z.string().max(200).optional(),
});

export const newsletterInput = z.strictObject({ email, company: z.string().max(200).optional() });

export const deliveryQuoteInput = z.strictObject({
  pincode: z.string().trim().max(10),
  subtotal: z.int().min(0).optional(),
});

/** Token from a tracking link, for paying or opening an order/booking. */
export const tokenInput = z.strictObject({ token: z.string().min(1).max(100) });

/** Parses request data or throws a 400 whose `details` maps each field to a code. */
export function parse<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const details: Record<string, string> = {};
  for (const issue of result.error.issues) details[issue.path.join(".") || "_"] ??= issue.message;
  throw new HttpError(400, "VALIDATION_FAILED", "Some fields are missing or invalid", details);
}
