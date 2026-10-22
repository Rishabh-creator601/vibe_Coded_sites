"use server";

import { isEmail, normalisePhone } from "@/lib/validate";

const TOPICS = ["general", "booking", "order", "events", "feedback"];
export type ContactField = "name" | "email" | "phone" | "message";

export type ContactResult = { ok: true; ref: string } | { ok: false; errors: Partial<Record<ContactField, "required" | "invalid" | "short">> };

/**
 * Checks a contact-form message on the server and logs it. This is the demo stand-in
 * for POST /api/v1/contact, which will save it to MongoDB and email the café.
 */
export async function sendContactMessage(input: { name: string; email: string; phone: string; topic: string; message: string; company?: string }): Promise<ContactResult> {
  const name = String(input.name ?? "").trim().slice(0, 80);
  const email = String(input.email ?? "").trim().slice(0, 120);
  const phoneRaw = String(input.phone ?? "").trim();
  const message = String(input.message ?? "").trim().slice(0, 2000);
  const topic = TOPICS.includes(input.topic) ? input.topic : "general";

  // Honeypot: people never fill the hidden "company" field; bots do. Pretend it worked.
  if (input.company) return { ok: true, ref: "MSG-000000" };

  const errors: Extract<ContactResult, { ok: false }>["errors"] = {};
  if (!name) errors.name = "required";
  if (!isEmail(email)) errors.email = "invalid";
  if (phoneRaw && !normalisePhone(phoneRaw)) errors.phone = "invalid";
  if (message.length < 10) errors.message = "short";
  if (Object.keys(errors).length) return { ok: false, errors };

  const ref = `MSG-${Date.now().toString(36).slice(-6).toUpperCase()}`;
  await new Promise((r) => setTimeout(r, 500));
  console.info("[contact]", JSON.stringify({ ref, topic, name, email, phone: phoneRaw ? normalisePhone(phoneRaw) : null, message, at: new Date().toISOString() }));
  return { ok: true, ref };
}
