"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bike, LoaderCircle, ShoppingBag, UtensilsCrossed } from "lucide-react";
import {
  computeTotals,
  demoMenu,
  formatClock,
  formatNumber,
  formatPrice,
  getItemAvailability,
  isEmail,
  makeReference,
  normalisePhone,
  priceLines,
  quoteDelivery,
  toMinutes,
  type CafeSettings,
  type Locale,
  type OrderRecord,
  type OrderType,
  type PaymentMethod,
} from "@saffron/shared";
import { Link, useRouter } from "@/i18n/navigation";
import { DemoPayment } from "@/components/payment/demo-payment";
import { describedBy, Field, inputClass, OptionCard } from "@/components/ui/form";
import { apiFetch, USE_API } from "@/lib/api";
import { useApiErrorMessage } from "@/lib/use-api-error";
import { useCafeNow } from "@/lib/use-cafe-now";
import { useStoresHydrated } from "@/lib/use-hydrated";
import { useCart } from "@/store/cart";
import { useRecords } from "@/store/records";
import { LineSummary, TotalsSummary } from "./line-summary";

type ErrorKey = "table" | "line1" | "line2" | "pincode" | "name" | "phone" | "email";
const TYPES: { key: OrderType; icon: typeof Bike }[] = [
  { key: "pickup", icon: ShoppingBag },
  { key: "dineIn", icon: UtensilsCrossed },
  { key: "delivery", icon: Bike },
];

export function CheckoutForm({ settings }: { settings: CafeSettings }) {
  const t = useTranslations("checkout");
  const tf = useTranslations("form");
  const tw = useTranslations("ways");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const hydrated = useStoresHydrated();
  const now = useCafeNow(settings.timezone);
  const lines = useCart((s) => s.lines);
  const clearCart = useCart((s) => s.clear);
  const saveOrder = useRecords((s) => s.saveOrder);

  const [type, setType] = useState<OrderType>("pickup");
  const [pickupTime, setPickupTime] = useState<"asap" | number>("asap");
  const [table, setTable] = useState("");
  const [address, setAddress] = useState({ line1: "", line2: "", landmark: "", city: "Mumbai", pincode: "" });
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [method, setMethod] = useState<PaymentMethod>("online");
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [paying, setPaying] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  // API mode: the order waiting for the demo payment. Closing the payment screen drops
  // it; the API cancels unpaid online orders after 15 minutes.
  const [pending, setPending] = useState<{ id: string; token: string } | null>(null);
  const apiErrorMessage = useApiErrorMessage();

  const priced = priceLines(lines, demoMenu);
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const quote = type === "delivery" && address.pincode.length === 6 ? quoteDelivery(address.pincode, settings) : null;
  const totals = computeTotals(subtotal, settings, type === "delivery" && quote?.ok ? { pincode: address.pincode } : undefined);
  const belowMin = quote?.ok ? Math.max(0, quote.minOrder - subtotal) : 0;
  const codAllowed = settings.delivery.codEnabled && totals.total <= settings.delivery.codMaxOrder;
  const servedLater = now ? priced.some((l) => !getItemAvailability(l.item, settings, now).orderable) : false;

  // Pickup slots every 15 minutes, starting after the kitchen's lead time.
  const pickupSlots: number[] = [];
  if (now) {
    const first = Math.ceil((now.minutes + settings.pickupLeadMinutes + 10) / 15) * 15;
    for (let m = Math.max(first, toMinutes(settings.openingHours.start) + 15); m <= toMinutes(settings.openingHours.end) - 15; m += 15) pickupSlots.push(m);
  }

  // Each order type has its own pay-later option.
  useEffect(() => {
    if (method === "cod" && type !== "delivery") setMethod("counter");
    if (method === "counter" && type === "delivery") setMethod(codAllowed ? "cod" : "online");
    if (method === "cod" && !codAllowed) setMethod("online");
  }, [type, method, codAllowed]);

  const done = useCallback(
    (id: string, token?: string) => {
      setDoneId(id);
      clearCart();
      router.replace({ pathname: "/order", query: token ? { id, token } : { id } });
    },
    [clearCart, router],
  );

  /** API mode: the server checks and prices the order again before saving it. */
  async function placeOrder() {
    setSubmitting(true);
    setApiError(null);
    try {
      const { order, token } = await apiFetch<{ order: OrderRecord; token: string }>("/orders", {
        method: "POST",
        body: {
          locale,
          type,
          pickupTime: type === "pickup" ? pickupTime : undefined,
          table: type === "dineIn" ? table.trim() : undefined,
          address: type === "delivery" ? address : undefined,
          customer,
          lines: lines.map(({ slug, qty, variant, addOns }) => ({ slug, qty, variant, addOns: addOns?.length ? addOns : undefined })),
          paymentMethod: method,
        },
      });
      if (method === "online") {
        setPending({ id: order.id, token });
        setPaying(true);
      } else done(order.id, token);
    } catch (err) {
      setApiError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function payPending() {
    if (!pending) return;
    try {
      await apiFetch(`/orders/${pending.id}/demo-payment`, { method: "POST", body: { token: pending.token } });
      done(pending.id, pending.token);
    } catch (err) {
      setPaying(false);
      setPending(null);
      setApiError(apiErrorMessage(err));
    }
  }

  const finish = useCallback(
    (paid: boolean) => {
      const id = makeReference("SO", now?.isoDate ?? new Date().toISOString().slice(0, 10));
      saveOrder({
        id,
        createdAt: new Date().toISOString(),
        locale,
        type,
        pickupTime: type === "pickup" ? pickupTime : undefined,
        table: type === "dineIn" ? table.trim() : undefined,
        address: type === "delivery" ? { ...address, line1: address.line1.trim(), line2: address.line2.trim(), landmark: address.landmark.trim() } : undefined,
        customer: { name: customer.name.trim(), phone: normalisePhone(customer.phone)!, email: customer.email.trim() },
        lines,
        totals,
        payment: { method, status: paid ? "paid" : "pending" },
      });
      done(id);
    },
    [now, saveOrder, locale, type, pickupTime, table, address, customer, lines, totals, method, done],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<ErrorKey, string>> = {};
    if (type === "dineIn" && !/^\d{1,3}$/.test(table.trim())) next.table = t("tableRequired");
    if (type === "delivery") {
      if (!address.line1.trim()) next.line1 = t("addressRequired");
      if (!address.line2.trim()) next.line2 = t("addressRequired");
      if (!quote) next.pincode = tw("invalidPincode");
      else if (!quote.ok) next.pincode = quote.reason === "notCovered" ? tw("notCovered", { pincode: address.pincode }) : tw(quote.reason);
      else if (belowMin > 0) next.pincode = t("belowMinimum", { amount: formatPrice(belowMin, locale), min: formatPrice(quote.minOrder, locale) });
    }
    if (!customer.name.trim()) next.name = tf("nameRequired");
    if (!normalisePhone(customer.phone)) next.phone = tf("phoneInvalid");
    if (!isEmail(customer.email)) next.email = tf("emailInvalid");
    setErrors(next);
    const first = (["table", "line1", "line2", "pincode", "name", "phone", "email"] as const).find((k) => next[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (USE_API) void placeOrder();
    else if (method === "online") setPaying(true);
    else finish(false);
  }

  if (!hydrated || doneId)
    return (
      <div className="flex justify-center py-24" role="status">
        <LoaderCircle className="size-8 animate-spin text-kulhad" aria-hidden="true" />
      </div>
    );

  if (lines.length === 0)
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-line px-6 py-14 text-center">
        <p className="text-lg">{t("empty")}</p>
        <Link href="/menu" className="btn btn-primary mt-6">
          {t("toMenu")}
        </Link>
      </div>
    );

  const f = (name: string) => `${id}-${name}`;
  const input = (name: ErrorKey, value: string, onChange: (v: string) => void, { hint, ...extra }: React.InputHTMLAttributes<HTMLInputElement> & { hint?: boolean } = {}) => (
    <input
      id={f(name)}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      aria-invalid={!!errors[name]}
      aria-describedby={describedBy(f(name), hint, errors[name])}
      {...extra}
    />
  );
  const section = "border-t border-line py-8 first:border-t-0 first:pt-0";

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <div>
        <section className={section} aria-labelledby="co-type">
          <h2 id="co-type" className="text-3xl">
            {t("typeTitle")}
          </h2>
          <fieldset className="mt-5 grid gap-2 sm:grid-cols-3">
            <legend className="sr-only">{t("typeTitle")}</legend>
            {TYPES.map(({ key, icon: Icon }) => (
              <label key={key} className="relative cursor-pointer">
                <input type="radio" name="order-type" checked={type === key} onChange={() => setType(key)} className="peer sr-only" />
                <span className="flex min-h-16 items-center gap-3 rounded-2xl border-[1.5px] border-line bg-white px-4 text-lg font-semibold transition-colors duration-150 peer-checked:border-roast peer-checked:bg-roast peer-checked:text-cream peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-saffron hover:border-roast">
                  <Icon className="size-6" aria-hidden="true" />
                  {t(key)}
                </span>
              </label>
            ))}
          </fieldset>

          <div className="mt-6">
            {type === "pickup" && (
              <Field id={f("pickupTime")} label={t("pickupTime")} className="max-w-sm">
                <select
                  id={f("pickupTime")}
                  value={String(pickupTime)}
                  onChange={(e) => setPickupTime(e.target.value === "asap" ? "asap" : Number(e.target.value))}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="asap">{t("asap", { minutes: formatNumber(settings.pickupLeadMinutes, locale) })}</option>
                  {pickupSlots.map((m) => (
                    <option key={m} value={m}>
                      {formatClock(m, locale, { minutes: true })}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {type === "dineIn" && (
              <Field id={f("table")} label={t("table")} hint={t("tableHint")} error={errors.table} className="max-w-xs">
                {input("table", table, setTable, { inputMode: "numeric", maxLength: 3, hint: true })}
              </Field>
            )}
            {type === "delivery" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id={f("line1")} label={t("line1")} error={errors.line1}>
                  {input("line1", address.line1, (v) => setAddress((a) => ({ ...a, line1: v })), { autoComplete: "address-line1" })}
                </Field>
                <Field id={f("line2")} label={t("line2")} error={errors.line2}>
                  {input("line2", address.line2, (v) => setAddress((a) => ({ ...a, line2: v })), { autoComplete: "address-line2" })}
                </Field>
                <Field id={f("landmark")} label={t("landmark")}>
                  <input id={f("landmark")} value={address.landmark} onChange={(e) => setAddress((a) => ({ ...a, landmark: e.target.value }))} className={inputClass} />
                </Field>
                <Field id={f("city")} label={t("city")}>
                  <input id={f("city")} value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} autoComplete="address-level2" className={inputClass} />
                </Field>
                <Field id={f("pincode")} label={t("pincode")} hint={tw("pincodeHint")} error={errors.pincode}>
                  {input("pincode", address.pincode, (v) => setAddress((a) => ({ ...a, pincode: v.replace(/\D/g, "") })), {
                    inputMode: "numeric",
                    maxLength: 6,
                    autoComplete: "postal-code",
                    hint: true,
                  })}
                </Field>
                <p role="status" className={`self-end pb-3 text-[0.98rem] font-medium ${quote?.ok ? "text-leaf" : "text-chili"}`}>
                  {quote?.ok
                    ? tw("deliverable", {
                        pincode: address.pincode,
                        fee: formatPrice(quote.fee, locale),
                        minutes: formatNumber(quote.etaMinutes, locale),
                        min: formatPrice(quote.minOrder, locale),
                      })
                    : quote && !errors.pincode
                      ? quote.reason === "notCovered"
                        ? tw("notCovered", { pincode: address.pincode })
                        : tw(quote.reason)
                      : null}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className={section} aria-labelledby="co-details">
          <h2 id="co-details" className="text-3xl">
            {t("detailsTitle")}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field id={f("name")} label={tf("name")} error={errors.name}>
              {input("name", customer.name, (v) => setCustomer((c) => ({ ...c, name: v })), { autoComplete: "name" })}
            </Field>
            <Field id={f("phone")} label={tf("phone")} error={errors.phone}>
              {input("phone", customer.phone, (v) => setCustomer((c) => ({ ...c, phone: v })), { type: "tel", inputMode: "tel", autoComplete: "tel" })}
            </Field>
            <Field id={f("email")} label={tf("email")} error={errors.email} className="sm:col-span-2">
              {input("email", customer.email, (v) => setCustomer((c) => ({ ...c, email: v })), { type: "email", autoComplete: "email" })}
            </Field>
          </div>
        </section>

        <section className={section} aria-labelledby="co-pay">
          <h2 id="co-pay" className="text-3xl">
            {t("payTitle")}
          </h2>
          <fieldset className="mt-5 grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">{t("payTitle")}</legend>
            <OptionCard name="order-pay" checked={method === "online"} onChange={() => setMethod("online")} title={t("payOnline")} hint={t("payOnlineHint")} />
            {type === "delivery" ? (
              <OptionCard
                name="order-pay"
                checked={method === "cod"}
                onChange={() => setMethod("cod")}
                disabled={!codAllowed}
                title={t("cod")}
                hint={codAllowed ? t("codHint") : t("codLimit", { amount: formatPrice(settings.delivery.codMaxOrder, locale) })}
              />
            ) : (
              <OptionCard name="order-pay" checked={method === "counter"} onChange={() => setMethod("counter")} title={t("payCounter")} hint={t("payCounterHint")} />
            )}
          </fieldset>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl bg-roast p-6 text-cream">
          <h2 className="text-2xl">{t("summary")}</h2>
          <div className="mt-3">
            <LineSummary lines={lines} dark />
          </div>
          <div className="mt-4">
            <TotalsSummary totals={totals} taxPercent={settings.taxPercent} showDelivery={type === "delivery"} dark />
          </div>
          {servedLater && <p className="mt-4 rounded-xl bg-cream/10 px-3 py-2 text-sm">{t("laterNote")}</p>}
          {Object.values(errors).some(Boolean) && (
            <p role="alert" className="mt-4 rounded-xl bg-cream/10 px-3 py-2 text-sm">
              {tf("fixErrors")}
            </p>
          )}
          {apiError && (
            <p role="alert" className="mt-4 rounded-xl bg-cream/10 px-3 py-2 text-sm">
              {apiError}
            </p>
          )}
          <button type="submit" disabled={submitting} className="btn mt-5 w-full cursor-pointer bg-saffron text-roast hover:bg-saffron-soft disabled:cursor-wait disabled:opacity-70">
            {method === "online" ? t("placePay", { amount: formatPrice(totals.total, locale) }) : t("place")}
          </button>
        </div>
      </aside>

      <DemoPayment
        amount={totals.total}
        open={paying}
        onClose={() => {
          setPaying(false);
          setPending(null);
        }}
        onPaid={() => (USE_API ? void payPending() : finish(true))}
      />
    </form>
  );
}
