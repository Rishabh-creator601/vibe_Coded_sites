"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarCheck, LoaderCircle } from "lucide-react";
import { formatClock, formatDate, formatPrice, type BookingRecord, type Locale } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { LineSummary } from "@/components/checkout/line-summary";
import { USE_API } from "@/lib/api";
import { useApiRecord } from "@/lib/use-api-record";
import { useApiErrorMessage } from "@/lib/use-api-error";
import { useStoresHydrated } from "@/lib/use-hydrated";
import { useQueryParam } from "@/lib/use-query-param";
import { useRecords } from "@/store/records";

export function BookingView() {
  const t = useTranslations("booking");
  const tr = useTranslations("reviewBooking");
  const tf = useTranslations("reserveForm");
  const tp = useTranslations("periods");
  const tc = useTranslations("cuisines");
  const tfe = useTranslations("featured");
  const locale = useLocale() as Locale;
  const id = useQueryParam("id") ?? "";
  const token = useQueryParam("token") ?? "";
  const apiErrorMessage = useApiErrorMessage();
  const hydrated = useStoresHydrated();
  const saved = useRecords((s) => s.bookings[id]);
  const remote = useApiRecord<{ booking: BookingRecord }>(USE_API && id ? `/reservations/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}` : null);
  const booking = USE_API ? (remote.state === "ready" ? remote.data.booking : undefined) : saved;

  if (USE_API ? id && remote.state === "loading" : !hydrated)
    return (
      <div className="flex justify-center py-24" role="status">
        <LoaderCircle className="size-8 animate-spin text-kulhad" aria-hidden="true" />
      </div>
    );

  if (!booking)
    return (
      <div className="container-page py-20">
        <p className="max-w-xl text-lg">{remote.state === "error" ? apiErrorMessage(remote.error) : USE_API ? t("notFoundLink") : t("notFound")}</p>
        <Link href="/reserve" className="btn btn-primary mt-6">
          {t("another")}
        </Link>
      </div>
    );

  const date = formatDate(booking.date, locale);
  const time = formatClock(booking.time, locale, { minutes: true });

  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <CalendarCheck className="size-12 text-leaf" aria-hidden="true" />
      <h1 className="mt-4 text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-xl text-roast-soft">{t("body", { date, time, ref: booking.id })}</p>

      <section aria-labelledby="booking-details" className="mt-10 max-w-3xl rounded-3xl border border-line bg-paper p-6 sm:p-8">
        <h2 id="booking-details" className="text-2xl">
          {t("details")}
        </h2>
        <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-roast-soft">{tr("when")}</dt>
            <dd className="mt-1 text-lg">{tr("dateTime", { date, time })}</dd>
            <dd className="text-roast-soft">{tp(booking.period)}</dd>
          </div>
          <div>
            <dt className="text-sm text-roast-soft">{tr("party")}</dt>
            <dd className="mt-1 text-lg">{tf("people", { count: booking.party })}</dd>
          </div>
          <div>
            <dt className="text-sm text-roast-soft">{tr("food")}</dt>
            <dd className="mt-1 text-lg">{booking.cuisines.length ? booking.cuisines.map((c) => tc(c)).join(", ") : tf("anything")}</dd>
          </div>
          <div>
            <dt className="text-sm text-roast-soft">{tr("contact")}</dt>
            <dd className="mt-1 text-lg">{booking.customer.name}</dd>
            <dd className="text-roast-soft tabular-nums">{booking.customer.phone}</dd>
          </div>
          {booking.preorder.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-roast-soft">{tr("preorder")}</dt>
              <dd className="mt-1">
                <LineSummary lines={booking.preorder} />
              </dd>
              <dd className="mt-3 font-semibold">
                {booking.payment.status === "paid" && booking.preorderTotals
                  ? t("paidOnline", { amount: formatPrice(booking.preorderTotals.total, locale) })
                  : t("payAtCafe")}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <p className="mt-6 max-w-2xl text-sm text-roast-soft">{USE_API ? t("savedNote") : t("demoNote")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/menu" className="btn btn-primary">
          {tfe("fullMenu")}
        </Link>
        <Link href="/reserve" className="btn btn-outline">
          {t("another")}
        </Link>
      </div>
    </div>
  );
}
