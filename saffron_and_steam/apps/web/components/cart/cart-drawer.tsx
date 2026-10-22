"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, X } from "lucide-react";
import { demoMenu, formatNumber, formatPrice, pick, priceLines, type Locale } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { DietMark } from "@/components/diet-mark";
import { cartCount, useCart } from "@/store/cart";

// Display prices only. The API recalculates every price at checkout (PLAN.md 9.2).
// Until the menu API exists (phase 2), the cart reads the shared demo menu.
function useCartTotals() {
  const lines = useCart((s) => s.lines);
  const rows = lines.flatMap((line) => {
    const [priced] = priceLines([line], demoMenu);
    return priced ? [{ line, item: priced.item, total: priced.lineTotal }] : [];
  });
  return { rows, count: cartCount(lines), subtotal: rows.reduce((s, r) => s + r.total, 0) };
}

export function CartDrawer() {
  const t = useTranslations("cart");
  const tf = useTranslations("featured");
  const locale = useLocale() as Locale;
  const ref = useRef<HTMLDialogElement>(null);
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const setQty = useCart((s) => s.setQty);
  const { rows, subtotal } = useCartTotals();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="cart-title"
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-paper p-0 text-roast open:flex open:flex-col"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 id="cart-title" className="text-2xl">
          {t("title")}
        </h2>
        <button type="button" onClick={close} aria-label={t("close")} className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream">
          <X className="size-6" aria-hidden="true" />
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-roast-soft">{t("empty")}</p>
      ) : (
        <ul className="flex-1 overflow-y-auto px-5">
          {rows.map(({ line, item, total }) => {
            const name = pick(item.name, locale);
            return (
              <li key={line.key} className="flex gap-4 border-b border-line py-4">
                {item.images[0] ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-line">
                    <Image src={item.images[0].url} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                ) : (
                  <div className="size-16 shrink-0 rounded-xl bg-cream" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-start gap-2 leading-snug font-medium">
                    <span className="mt-1">
                      <DietMark diet={item.diet} label={tf(`diet.${item.diet}`)} size={14} />
                    </span>
                    {name}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-line" role="group" aria-label={`${t("quantity")}: ${name}`}>
                      <button
                        type="button"
                        onClick={() => setQty(line.key, line.qty - 1)}
                        aria-label={t("decrease", { name })}
                        className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream"
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </button>
                      <span className="w-6 text-center tabular-nums" aria-live="polite">
                        {formatNumber(line.qty, locale)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(line.key, line.qty + 1)}
                        aria-label={t("increase", { name })}
                        className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream"
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="font-semibold tabular-nums">{formatPrice(total, locale)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {rows.length > 0 && (
        <div className="mt-auto border-t border-line px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <p className="flex justify-between text-lg font-semibold">
            <span>{t("subtotal")}</span>
            <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
          </p>
          <p className="mt-1 text-sm text-roast-soft">{t("taxNote")}</p>
          <Link href="/checkout" onClick={close} className="btn btn-primary mt-4 w-full">
            {t("checkout")}
          </Link>
        </div>
      )}
    </dialog>
  );
}

/** Mobile-only bar: "View cart (3)" and the running total, above the bottom edge. */
export function MobileCartBar() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const open = useCart((s) => s.open);
  const isOpen = useCart((s) => s.isOpen);
  const { count, subtotal } = useCartTotals();
  if (count === 0) return null;
  return (
    <>
      <div className="h-20 md:hidden" aria-hidden="true" />
      <div className={`fixed inset-x-0 bottom-0 z-20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden ${isOpen ? "hidden" : ""}`}>
        <button type="button" onClick={open} className="btn btn-primary w-full cursor-pointer justify-between px-6 shadow-[0_12px_28px_-10px_rgb(42_26_18/0.6)]">
          <span>{t("view", { count: formatNumber(count, locale) })}</span>
          <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
        </button>
      </div>
    </>
  );
}
