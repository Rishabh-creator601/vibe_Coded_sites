"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatNumber, formatPrice, quoteDelivery, type CafeSettings, type DeliveryQuote, type Locale } from "@saffron/shared";

/** "Do you deliver to me?" Uses the same zone lookup as the API's POST /delivery/quote will. */
export function DeliveryChecker({ settings }: { settings: CafeSettings }) {
  const t = useTranslations("ways");
  const locale = useLocale() as Locale;
  const id = useId();
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<{ pincode: string; quote: DeliveryQuote } | null>(null);

  let message: string | null = null;
  if (result) {
    const { quote } = result;
    if (quote.ok)
      message = t("deliverable", {
        pincode: result.pincode,
        fee: formatPrice(quote.fee, locale),
        minutes: formatNumber(quote.etaMinutes, locale),
        min: formatPrice(quote.minOrder, locale),
      });
    else if (quote.reason === "notCovered") message = t("notCovered", { pincode: result.pincode });
    else message = t(quote.reason);
  }
  const invalid = result?.quote.ok === false && result.quote.reason === "invalidPincode";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setResult({ pincode: pincode.trim(), quote: quoteDelivery(pincode, settings) });
      }}
      className="mt-5"
    >
      <label htmlFor={`${id}-pin`} className="block font-semibold">
        {t("pincodeLabel")}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={`${id}-pin`}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder={t("pincodePlaceholder")}
          aria-describedby={`${id}-hint ${id}-result`}
          aria-invalid={invalid || undefined}
          className="min-h-12 w-full min-w-0 rounded-full border-[1.5px] border-line bg-white px-5 tabular-nums placeholder:text-roast-soft/70 focus:border-roast focus:outline-none aria-[invalid]:border-chili"
        />
        <button type="submit" className="btn btn-outline shrink-0 cursor-pointer px-5">
          {t("check")}
        </button>
      </div>
      <p id={`${id}-hint`} className="mt-2 text-sm text-roast-soft">
        {t("pincodeHint")}
      </p>
      <p id={`${id}-result`} role="status" className={`mt-2 text-[0.98rem] font-medium ${result?.quote.ok ? "text-leaf" : "text-chili"}`}>
        {message}
      </p>
    </form>
  );
}
