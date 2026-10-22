"use client";

import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, LoaderCircle } from "lucide-react";
import { demoSettings, formatClock, type Locale } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { useStoresHydrated } from "@/lib/use-hydrated";
import { useQueryParam } from "@/lib/use-query-param";
import { useRecords, type OrderRecord } from "@/store/records";
import { LineSummary, TotalsSummary } from "./line-summary";

type Step = "placed" | "accepted" | "preparing" | "ready" | "completed" | "outForDelivery" | "delivered";

// PLAN.md 9.3 status flow. In the demo each step starts a fixed number of minutes after
// the order was placed; the real tracking page will listen to the API over SSE.
const FLOW: Record<"counter" | "delivery", [Step, number][]> = {
  counter: [["placed", 0], ["accepted", 1], ["preparing", 2], ["ready", 5], ["completed", 7]],
  delivery: [["placed", 0], ["accepted", 1], ["preparing", 2], ["ready", 5], ["outForDelivery", 6], ["delivered", 9]],
};

// A 10-second clock, read only in the browser (null while the page is pre-rendered).
function subscribeTenSeconds(onChange: () => void) {
  const id = setInterval(onChange, 10_000);
  return () => clearInterval(id);
}
const tenSecondBucket = () => Math.floor(Date.now() / 10_000) * 10_000;

function useMinutesSince(iso: string | undefined) {
  const now = useSyncExternalStore(subscribeTenSeconds, tenSecondBucket, () => null);
  return iso && now ? (now - new Date(iso).getTime()) / 60_000 : 0;
}

function placeLine(order: OrderRecord, t: ReturnType<typeof useTranslations<"order">>) {
  if (order.type === "dineIn") return t("dineIn", { table: order.table ?? "" });
  if (order.type === "delivery" && order.address) return t("delivery", { address: [order.address.line1, order.address.line2, order.address.pincode].filter(Boolean).join(", ") });
  return t("pickup");
}

export function OrderView() {
  const t = useTranslations("order");
  const locale = useLocale() as Locale;
  const id = useQueryParam("id") ?? "";
  const hydrated = useStoresHydrated();
  const order = useRecords((s) => s.orders[id]);
  const elapsed = useMinutesSince(order?.createdAt);

  if (!hydrated)
    return (
      <div className="flex justify-center py-24" role="status">
        <LoaderCircle className="size-8 animate-spin text-kulhad" aria-hidden="true" />
      </div>
    );

  if (!order)
    return (
      <div className="container-page py-20">
        <p className="max-w-xl text-lg">{t("notFound")}</p>
        <Link href="/menu" className="btn btn-primary mt-6">
          {t("more")}
        </Link>
      </div>
    );

  const flow = FLOW[order.type === "delivery" ? "delivery" : "counter"];
  const currentIndex = flow.reduce((idx, [, at], i) => (elapsed >= at ? i : idx), 0);
  const pickupAt = order.type === "pickup" && typeof order.pickupTime === "number" ? formatClock(order.pickupTime, locale, { minutes: true }) : null;
  const payment = order.payment.status === "paid" ? t("paid") : order.payment.method === "cod" ? t("payCod") : t("payCounter");

  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <p className="font-semibold text-kulhad tabular-nums">{t("reference", { ref: order.id })}</p>
      <h1 className="mt-2 text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
      <p className="mt-3 text-xl text-roast-soft">
        {placeLine(order, t)}
        {pickupAt && <span className="tabular-nums">, {pickupAt}</span>}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <section aria-labelledby="order-status">
          <h2 id="order-status" className="text-3xl">
            {t("status")}
          </h2>
          <ol className="mt-6">
            {flow.map(([step], i) => {
              const done = i < currentIndex;
              const current = i === currentIndex;
              return (
                <li key={step} className="relative flex gap-4 pb-8 last:pb-0" aria-current={current ? "step" : undefined}>
                  {i < flow.length - 1 && <span className={`absolute top-10 bottom-0 left-[1.1875rem] w-0.5 ${done ? "bg-leaf" : "bg-line"}`} aria-hidden="true" />}
                  <span
                    className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${
                      done ? "border-leaf bg-leaf text-white" : current ? "border-kulhad bg-kulhad text-white" : "border-line bg-paper text-roast-soft"
                    }`}
                  >
                    {done ? <Check className="size-5" aria-hidden="true" /> : current ? <span className="size-2.5 animate-pulse rounded-full bg-white" /> : <span className="text-sm font-semibold">{i + 1}</span>}
                  </span>
                  <span className={`pt-1.5 text-lg ${current ? "font-semibold" : done ? "" : "text-roast-soft"}`}>{t(`steps.${step}`)}</span>
                </li>
              );
            })}
          </ol>
          <p role="status" className="sr-only">
            {t(`steps.${flow[currentIndex][0]}`)}
          </p>
          <p className="mt-8 max-w-xl text-sm text-roast-soft">{t("demoNote")}</p>
        </section>

        <aside className="lg:self-start">
          <div className="rounded-3xl border border-line bg-paper p-6">
            <h2 className="text-2xl">{t("items")}</h2>
            <div className="mt-3">
              <LineSummary lines={order.lines} />
            </div>
            <div className="mt-4">
              <TotalsSummary totals={order.totals} taxPercent={demoSettings.taxPercent} showDelivery={order.type === "delivery"} />
            </div>
            <p className={`mt-4 font-semibold ${order.payment.status === "paid" ? "text-leaf" : ""}`}>{payment}</p>
            <p className="mt-1 text-sm text-roast-soft">
              {order.customer.name}, <span className="tabular-nums">{order.customer.phone}</span>
            </p>
          </div>
          <Link href="/menu" className="btn btn-outline mt-5 w-full">
            {t("more")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
