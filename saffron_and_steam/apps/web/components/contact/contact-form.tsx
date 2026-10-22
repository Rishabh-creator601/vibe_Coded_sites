"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { sendContactMessage, type ContactField, type ContactResult } from "@/app/[locale]/contact/actions";
import { describedBy, Field, inputClass } from "@/components/ui/form";

const TOPICS = ["general", "booking", "order", "events", "feedback"] as const;
type Errors = Extract<ContactResult, { ok: false }>["errors"];

export function ContactForm() {
  const t = useTranslations("contact");
  const tf = useTranslations("form");
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "failed">("idle");
  const [sent, setSent] = useState<{ ref: string; name: string; email: string } | null>(null);

  const errorText = (field: ContactField) => {
    if (!errors[field]) return undefined;
    if (field === "name") return tf("nameRequired");
    if (field === "email") return tf("emailInvalid");
    if (field === "phone") return tf("phoneInvalid");
    return t("messageShort");
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setState("sending");
    try {
      const res = await sendContactMessage({ name: data.name, email: data.email, phone: data.phone, topic: data.topic, message: data.message, company: data.company });
      setState("idle");
      if (res.ok) {
        setErrors({});
        setSent({ ref: res.ref, name: data.name.trim(), email: data.email.trim() });
        return;
      }
      setErrors(res.errors);
      const first = (["name", "email", "phone", "message"] as const).find((f) => res.errors[f]);
      if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    } catch {
      setState("failed");
    }
  }

  if (sent)
    return (
      <div role="status" className="self-start rounded-3xl border border-line bg-paper p-6 sm:p-8">
        <CheckCircle2 className="size-10 text-leaf" aria-hidden="true" />
        <h2 className="mt-4 text-3xl">{t("sentTitle")}</h2>
        <p className="mt-3 text-lg text-roast-soft">{t("sentBody", sent)}</p>
        <button type="button" onClick={() => setSent(null)} className="btn btn-outline mt-6 cursor-pointer">
          {t("another")}
        </button>
      </div>
    );

  const f = (name: string) => `${id}-${name}`;
  const control = (name: ContactField, hint?: boolean) => ({
    id: f(name),
    name,
    className: inputClass,
    "aria-invalid": !!errors[name],
    "aria-describedby": describedBy(f(name), hint, errors[name]),
  });

  return (
    <form ref={form} noValidate onSubmit={onSubmit} className="self-start rounded-3xl border border-line bg-paper p-5 sm:p-8">
      <h2 className="text-3xl">{t("formTitle")}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field id={f("name")} label={tf("name")} error={errorText("name")}>
          <input {...control("name")} autoComplete="name" />
        </Field>
        <Field id={f("email")} label={tf("email")} error={errorText("email")}>
          <input {...control("email")} type="email" autoComplete="email" />
        </Field>
        <Field id={f("phone")} label={tf("phoneOptional")} error={errorText("phone")}>
          <input {...control("phone")} type="tel" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field id={f("topic")} label={t("topic")}>
          <select id={f("topic")} name="topic" defaultValue="general" className={`${inputClass} cursor-pointer`}>
            {TOPICS.map((k) => (
              <option key={k} value={k}>
                {t(`topics.${k}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field id={f("message")} label={t("message")} hint={t("messageHint")} error={errorText("message")} className="sm:col-span-2">
          <textarea {...control("message", true)} rows={6} maxLength={2000} className={`${inputClass} py-3`} />
        </Field>
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {state === "failed" && (
        <p role="alert" className="mt-4 font-medium text-chili">
          {t("failed")}
        </p>
      )}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary mt-6 w-full cursor-pointer disabled:opacity-60 sm:w-auto">
        {state === "sending" ? t("sending") : t("send")}
      </button>
      <p className="mt-4 text-sm text-roast-soft">{t("demoNote")}</p>
    </form>
  );
}
