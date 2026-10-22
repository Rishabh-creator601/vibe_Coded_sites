"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { demoMenu, formatPrice, pick, type Locale } from "@saffron/shared";
import { ApiError } from "./api";

/** Turns an API error into a sentence in the visitor's language. */
export function useApiErrorMessage() {
  const t = useTranslations("apiErrors");
  const locale = useLocale() as Locale;
  return useCallback(
    (err: unknown): string => {
      if (!(err instanceof ApiError)) return t("generic");
      const details = err.details ?? {};
      switch (err.code) {
        case "ITEM_UNAVAILABLE": {
          const item = demoMenu.find((i) => i.slug === details.slug);
          return t("itemUnavailable", { dish: item ? pick(item.name, locale) : String(details.slug ?? "") });
        }
        case "BELOW_MINIMUM":
          return t("belowMinimum", { min: formatPrice(Number(details.minOrder ?? 0), locale) });
        case "DELIVERY_UNAVAILABLE":
          return t("deliveryUnavailable");
        case "PAYMENT_METHOD_UNAVAILABLE":
          return t("paymentUnavailable");
        case "PICKUP_TIME_UNAVAILABLE":
          return t("pickupTime");
        case "SLOT_FULL":
          return t("slotFull", { seats: Number(details.coversLeft ?? 0) });
        case "SLOT_UNAVAILABLE":
          return t("slotUnavailable");
        case "ORDER_CANCELLED":
          return t("cancelled");
        case "RATE_LIMITED":
          return t("rateLimited");
        case "NETWORK":
          return t("network");
        default:
          return t("generic");
      }
    },
    [t, locale],
  );
}
