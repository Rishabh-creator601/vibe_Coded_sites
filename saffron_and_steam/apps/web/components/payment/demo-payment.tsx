"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Building2, CheckCircle2, CreditCard, LoaderCircle, Smartphone, X } from "lucide-react";
import { formatPrice, type Locale } from "@saffron/shared";

type Method = "upi" | "card" | "netbanking";
type Stage = "choose" | "processing" | "done";

/**
 * Stand-in for Razorpay Checkout. It asks for no card or bank details and takes no
 * money: it just shows the steps, then calls onPaid. Phase 6 swaps in Razorpay test mode.
 */
export function DemoPayment({ amount, open, onClose, onPaid }: { amount: number; open: boolean; onClose: () => void; onPaid: (method: Method) => void }) {
  const t = useTranslations("payment");
  const locale = useLocale() as Locale;
  const ref = useRef<HTMLDialogElement>(null);
  const [method, setMethod] = useState<Method>("upi");
  const [stage, setStage] = useState<Stage>("choose");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setStage("choose");
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (stage === "processing") {
      const id = setTimeout(() => setStage("done"), 1500);
      return () => clearTimeout(id);
    }
    if (stage === "done") {
      const id = setTimeout(() => onPaid(method), 900);
      return () => clearTimeout(id);
    }
  }, [stage, method, onPaid]);

  const price = formatPrice(amount, locale);
  const methods: { key: Method; icon: typeof Smartphone }[] = [
    { key: "upi", icon: Smartphone },
    { key: "card", icon: CreditCard },
    { key: "netbanking", icon: Building2 },
  ];

  return (
    <dialog
      ref={ref}
      aria-labelledby="pay-title"
      onCancel={(e) => stage !== "choose" && e.preventDefault()}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-paper p-0 text-roast"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 id="pay-title" className="text-2xl">
          {t("title", { amount: price })}
        </h2>
        {stage === "choose" && (
          <button type="button" onClick={onClose} aria-label={t("cancel")} className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream">
            <X className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="px-6 py-5">
        <p className="rounded-xl bg-saffron-soft/50 px-4 py-3 text-sm">{t("demoNote")}</p>

        {stage === "choose" && (
          <fieldset className="mt-5">
            <legend className="font-semibold">{t("choose")}</legend>
            <div className="mt-3 grid gap-2">
              {methods.map(({ key, icon: Icon }) => (
                <label key={key} className="relative cursor-pointer">
                  <input type="radio" name="pay-method" checked={method === key} onChange={() => setMethod(key)} className="peer sr-only" />
                  <span className="flex min-h-14 items-center gap-3 rounded-2xl border-[1.5px] border-line bg-white px-4 font-medium peer-checked:border-roast peer-checked:bg-cream peer-focus-visible:outline-3 peer-focus-visible:outline-saffron">
                    <Icon className="size-5 text-kulhad" aria-hidden="true" />
                    {t(key)}
                  </span>
                </label>
              ))}
            </div>
            <button type="button" onClick={() => setStage("processing")} className="btn btn-primary mt-5 w-full cursor-pointer">
              {t("pay", { amount: price })}
            </button>
          </fieldset>
        )}

        {stage !== "choose" && (
          <p role="status" className="flex flex-col items-center gap-3 py-8 text-center text-lg font-semibold">
            {stage === "processing" ? (
              <LoaderCircle className="size-10 animate-spin text-kulhad" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-10 text-leaf" aria-hidden="true" />
            )}
            {stage === "processing" ? t("processing") : t("success")}
          </p>
        )}
      </div>
    </dialog>
  );
}
