"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { USE_API } from "@/lib/api";

type State = "idle" | "sending" | "done" | "error" | "invalid";

/** Posts to the API's POST /newsletter through the same-origin /api rewrite (demo: just confirms). */
export function NewsletterForm() {
  const t = useTranslations("footer");
  const id = useId();
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    // Bots fill the hidden field; people never see it.
    if (data.get("company")) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setState("invalid");
    setState("sending");
    if (!USE_API) {
      // Browser-only demo: there is no API to save the address, so just confirm.
      setTimeout(() => setState("done"), 500);
      return;
    }
    try {
      const res = await fetch("/api/v1/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  const message = { idle: "", sending: "", done: t("subscribed"), error: t("subscribeError"), invalid: t("invalidEmail") }[state];

  return (
    <form noValidate onSubmit={onSubmit}>
      <label htmlFor={`${id}-email`} className="text-sm text-cream/75">
        {t("emailLabel")}
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={state === "invalid" || undefined}
          aria-describedby={`${id}-msg`}
          className="min-h-12 w-full min-w-0 rounded-full border-[1.5px] border-cream/30 bg-transparent px-5 text-cream placeholder:text-cream/50 focus:border-saffron focus:outline-none"
        />
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button type="submit" disabled={state === "sending"} className="btn shrink-0 cursor-pointer bg-saffron text-roast hover:bg-saffron-soft disabled:opacity-60">
          {state === "sending" ? t("subscribing") : t("subscribe")}
        </button>
      </div>
      <p id={`${id}-msg`} role="status" className={`mt-2 min-h-6 text-sm ${state === "done" ? "text-saffron-soft" : "text-[#f5b4a6]"}`}>
        {message}
      </p>
    </form>
  );
}
