"use server";

import { isEmail, normalisePhone } from "@saffron/shared";
import { apiFetch, ApiError, USE_API } from "@/lib/api";

const TOPICS = ["general", "booking", "order", "events", "feedback"];
export type ContactField = "name" | "email" | "phone" | "message";
type FieldError = "required" | "invalid" | "short";

export type ContactResult =
  | { ok: true; ref: string }
  /** `failed`: the message couldn't be delivered (API down), not a problem with the fields. */
  | { ok: false; errors: Partial<Record<ContactField, FieldError>>; failed?: boolean };

/**
 * Checks a contact-form message. With the API (NEXT_PUBLIC_USE_API=true) it goes to
 * POST /api/v1/contact, which saves it in MongoDB; without it, it's only logged here.
 */
export async function sendContactMessage(input: { name: string; email: string; phone: string; topic: string; message: string; company?: string }): Promise<ContactResult> {
  const name = String(input.name ?? "").trim().slice(0, 80);
  const email = String(input.email ?? "").trim().slice(0, 120);
  const phoneRaw = String(input.phone ?? "").trim();
  const message = String(input.message ?? "").trim().slice(0, 2000);
  const topic = TOPICS.includes(input.topic) ? input.topic : "general";

  // Honeypot: people never fill the hidden "company" field; bots do. Pretend it worked.
  if (input.company) return { ok: true, ref: "MSG-000000" };

  const errors: Partial<Record<ContactField, FieldError>> = {};
  if (!name) errors.name = "required";
  if (!isEmail(email)) errors.email = "invalid";
  if (phoneRaw && !normalisePhone(phoneRaw)) errors.phone = "invalid";
  if (message.length < 10) errors.message = "short";
  if (Object.keys(errors).length) return { ok: false, errors };

  if (USE_API) {
    try {
      const { reference } = await apiFetch<{ reference: string }>("/contact", {
        method: "POST",
        base: process.env.API_URL ?? "http://localhost:4000",
        body: { name, email, phone: phoneRaw, topic, message },
      });
      return { ok: true, ref: reference };
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_FAILED" && err.details) return { ok: false, errors: err.details as Partial<Record<ContactField, FieldError>> };
      console.error("[contact] API request failed", err);
      return { ok: false, errors: {}, failed: true };
    }
  }

  const ref = `MSG-${Date.now().toString(36).slice(-6).toUpperCase()}`;
  await new Promise((r) => setTimeout(r, 500));
  console.info("[contact]", JSON.stringify({ ref, topic, name, email, phone: phoneRaw ? normalisePhone(phoneRaw) : null, message, at: new Date().toISOString() }));
  return { ok: true, ref };
}
