"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";
import { computeTotals, demoMenu, formatClock, formatDate, formatPrice, makeReference, priceLines, type CafeSettings, type Locale } from "@saffron/shared";
import { Link, useRouter } from "@/i18n/navigation";
import { LineSummary, TotalsSummary } from "@/components/checkout/line-summary";
import { DemoPayment } from "@/components/payment/demo-payment";
import { OptionCard } from "@/components/ui/form";
import { useStoresHydrated } from "@/lib/use-hydrated";
import { useRecords } from "@/store/records";

export function ReviewBooking({ settings }: { settings: CafeSettings }) {
  const t = useTranslations("reviewBooking");
  const tr = useTranslations("reserveForm");
  const tp = useTranslations("periods");
  const tc = useTranslations("cuisines");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const hydrated = useStoresHydrated();
  const draft = useRecords((s) => s.draft);
  const saveBooking = useRecords((s) => s.saveBooking);
  const setDraft = useRecords((s) => s.setDraft);
  const [method, setMethod] = useState<"online" | "atCafe">("online");
  const [paying, setPaying] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const subtotal = draft ? priceLines(draft.preorder, demoMenu).reduce((s, l) => s + l.lineTotal, 0) : 0;
  const totals = subtotal > 0 ? computeTotals(subtotal, settings) : null;

  const finish = useCallback(
    (paid: boolean) => {
      if (!draft) return;
      const id = makeReference("SB", draft.date);
      saveBooking({
        ...draft,
        id,
        createdAt: new Date().toISOString(),
        preorderTotals: totals,
        payment: { method: totals && method === "online" ? "online" : "atCafe", status: paid ? "paid" : "pending" },
      });
      setDoneId(id);
      setDraft(null);
      router.replace({ pathname: "/booking", query: { id } });
    },
    [draft, totals, method, saveBooking, setDraft, router],
  );

  if (!hydrated || doneId)
    return (
      <div className="flex justify-center py-24" role="status">
        <LoaderCircle className="size-8 animate-spin text-kulhad" aria-hidden="true" />
      </div>
    );

  if (!draft)
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-line px-6 py-14 text-center">
        <p className="text-lg">{t("empty")}</p>
        <Link href="/reserve" className="btn btn-primary mt-6">
          {t("start")}
        </Link>
      </div>
    );

  const food = draft.cuisines.length ? draft.cuisines.map((c) => tc(c)).join(", ") : tr("anything");
  const dietLabel = draft.diet === "veg" ? tr("dietVeg") : draft.diet === "vegan" ? tr("dietVegan") : null;

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <div>
        <dl className="grid gap-x-8 gap-y-6 rounded-3xl border border-line bg-paper p-6 sm:grid-cols-2 sm:p-8">
          <div className="sm:col-span-2">
            <dt className="text-sm text-roast-soft">{t("when")}</dt>
            <dd className="mt-1 font-display text-2xl sm:text-3xl">
              {t("dateTime", { date: formatDate(draft.date, locale), time: formatClock(draft.time, locale, { minutes: true }) })}
            </dd>
            <dd className="text-roast-soft">{tp(draft.period)}</dd>
          </div>
          <div>
            <dt className="text-sm text-roast-soft">{t("party")}</dt>
            <dd className="mt-1 text-lg">{tr("people", { count: draft.party })}</dd>
          </div>
          <div>
            <dt className="text-sm text-roast-soft">{t("food")}</dt>
            <dd className="mt-1 text-lg">
              {food}
              {dietLabel && <span className="text-roast-soft">, {dietLabel}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-roast-soft">{t("contact")}</dt>
            <dd className="mt-1 text-lg">{draft.customer.name}</dd>
            <dd className="text-roast-soft tabular-nums">{draft.customer.phone}</dd>
            <dd className="break-all text-roast-soft">{draft.customer.email}</dd>
          </div>
          {draft.notes && (
            <div>
              <dt className="text-sm text-roast-soft">{t("notes")}</dt>
              <dd className="mt-1">{draft.notes}</dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-sm text-roast-soft">{t("preorder")}</dt>
            <dd className="mt-1">{draft.preorder.length ? <LineSummary lines={draft.preorder} /> : <p>{tr("noPreorder")}</p>}</dd>
          </div>
        </dl>
        <Link href="/reserve" className="link-underline mt-5 inline-block">
          {t("edit")}
        </Link>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl border border-line bg-paper p-6">
          {totals ? (
            <>
              <h2 className="text-2xl">{t("payTitle")}</h2>
              <div className="mt-4">
                <TotalsSummary totals={totals} taxPercent={settings.taxPercent} />
              </div>
              <fieldset className="mt-5 grid gap-2">
                <legend className="sr-only">{t("payTitle")}</legend>
                <OptionCard name="booking-pay" checked={method === "online"} onChange={() => setMethod("online")} title={t("payOnline")} hint={t("payOnlineHint")} />
                <OptionCard name="booking-pay" checked={method === "atCafe"} onChange={() => setMethod("atCafe")} title={t("payAtCafe")} hint={t("payAtCafeHint")} />
              </fieldset>
            </>
          ) : (
            <p className="text-roast-soft">{t("nothingToPay")}</p>
          )}
          <button
            type="button"
            onClick={() => (totals && method === "online" ? setPaying(true) : finish(false))}
            className="btn btn-primary mt-5 w-full cursor-pointer"
          >
            {totals && method === "online" ? t("confirmPay", { amount: formatPrice(totals.total, locale) }) : t("confirm")}
          </button>
        </div>
      </aside>

      {totals && <DemoPayment amount={totals.total} open={paying} onClose={() => setPaying(false)} onPaid={() => finish(true)} />}
    </div>
  );
}
