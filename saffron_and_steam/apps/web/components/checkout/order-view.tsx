"use client";

import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, LoaderCircle, X } from "lucide-react";
import { demoSettings, demoStepIndex, formatClock, orderFlow, type Locale, type OrderRecord } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { USE_API } from "@/lib/api";
import { useApiRecord } from "@/lib/use-api-record";
import { useApiErrorMessage } from "@/lib/use-api-error";
import { useStoresHydrated } from "@/lib/use-hydrated";
import { useQueryParam } from "@/lib/use-query-param";
import { useRecords } from "@/store/records";
import { LineSummary, TotalsSummary } from "./line-summary";

// PLAN.md 9.3 status flow. With the API, the status comes from the server, checked every
// 10 seconds (Server-Sent Events can replace this later). Without it, each step starts a
// fixed number of minutes after the order was placed (shared DEMO_ORDER_FLOW).

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

const FINAL = new Set(["completed", "delivered", "cancelled"]);

function placeLine(order: OrderRecord, t: ReturnType<typeof useTranslations<"order">>) {
  if (order.type === "dineIn") return t("dineIn", { table: order.table ?? "" });
  if (order.type === "delivery" && order.address) return t("delivery", { address: [order.address.line1, order.address.line2, order.address.pincode].filter(Boolean).join(", ") });
  return t("pickup");
}

function Spinner() {
  return (
    <div className="flex justify-center py-24" role="status">
      <LoaderCircle className="size-8 animate-spin text-kulhad" aria-hidden="true" />
    </div>
  );
}

export function OrderView() {
  const t = useTranslations("order");
  const id = useQueryParam("id") ?? "";
  const token = useQueryParam("token") ?? "";
  const apiErrorMessage = useApiErrorMessage();
  const hydrated = useStoresHydrated();
  const saved = useRecords((s) => s.orders[id]);
  const remote = useApiRecord<{ order: OrderRecord }>(USE_API && id ? `/orders/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}` : null, {
    pollMs: 10_000,
    done: ({ order }) => FINAL.has(order.status ?? ""),
  });

  if (USE_API ? id && remote.state === "loading" : !hydrated) return <Spinner />;

  const order = USE_API ? (remote.state === "ready" ? remote.data.order : undefined) : saved;
  if (!order)
    return (
      <div className="container-page py-20">
        <p className="max-w-xl text-lg">{remote.state === "error" ? apiErrorMessage(remote.error) : USE_API ? t("notFoundLink") : t("notFound")}</p>
        <Link href="/menu" className="btn btn-primary mt-6">
          {t("more")}
        </Link>
      </div>
    );

  return <OrderDetails order={order} />;
}

function OrderDetails({ order }: { order: OrderRecord }) {
  const t = useTranslations("order");
  const locale = useLocale() as Locale;
  const elapsed = useMinutesSince(order.createdAt);

  const flow = orderFlow(order.type);
  const cancelled = order.status === "cancelled";
  const currentIndex = order.status ? Math.max(0, flow.findIndex(([step]) => step === order.status)) : demoStepIndex(order.type, elapsed);
  const pickupAt = order.type === "pickup" && typeof order.pickupTime === "number" ? formatClock(order.pickupTime, locale, { minutes: true }) : null;
  const payment =
    order.payment.status === "paid" ? t("paid") : order.payment.method === "online" ? t("payPending") : order.payment.method === "cod" ? t("payCod") : t("payCounter");

  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <p className="font-semibold text-kulhad tabular-nums">{t("reference", { ref: order.id })}</p>
      <h1 className="mt-2 text-5xl leading-tight sm:text-6xl">{cancelled ? t("steps.cancelled") : t("title")}</h1>
      <p className="mt-3 text-xl text-roast-soft">
        {placeLine(order, t)}
        {pickupAt && <span className="tabular-nums">, {pickupAt}</span>}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <section aria-labelledby="order-status">
          <h2 id="order-status" className="text-3xl">
            {t("status")}
          </h2>
          {cancelled ? (
            <p role="status" className="mt-6 flex max-w-xl items-start gap-3 text-lg">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-chili text-white">
                <X className="size-5" aria-hidden="true" />
              </span>
              <span className="pt-1.5">{t("cancelledNote")}</span>
            </p>
          ) : (
            <>
              <ol className="mt-6">
                {flow.map(([step], i) => {
                  const done = i < currentIndex || (i === currentIndex && FINAL.has(step));
                  const current = i === currentIndex && !done;
                  return (
                    <li key={step} className="relative flex gap-4 pb-8 last:pb-0" aria-current={i === currentIndex ? "step" : undefined}>
                      {i < flow.length - 1 && <span className={`absolute top-10 bottom-0 left-[1.1875rem] w-0.5 ${i < currentIndex ? "bg-leaf" : "bg-line"}`} aria-hidden="true" />}
                      <span
                        className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${
                          done ? "border-leaf bg-leaf text-white" : current ? "border-kulhad bg-kulhad text-white" : "border-line bg-paper text-roast-soft"
                        }`}
                      >
                        {done ? <Check className="size-5" aria-hidden="true" /> : current ? <span className="size-2.5 animate-pulse rounded-full bg-white" /> : <span className="text-sm font-semibold">{i + 1}</span>}
                      </span>
                      <span className={`pt-1.5 text-lg ${i === currentIndex ? "font-semibold" : done ? "" : "text-roast-soft"}`}>{t(`steps.${step}`)}</span>
                    </li>
                  );
                })}
              </ol>
              <p role="status" className="sr-only">
                {t(`steps.${flow[currentIndex][0]}`)}
              </p>
              <p className="mt-8 max-w-xl text-sm text-roast-soft">{order.payment.method === "online" && order.payment.status !== "paid" ? t("waitingPayment") : t("demoNote")}</p>
            </>
          )}
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
