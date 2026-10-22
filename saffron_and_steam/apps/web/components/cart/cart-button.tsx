"use client";

import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";

export function CartButton() {
  const t = useTranslations("nav");
  const count = useCart((s) => cartCount(s.lines));
  const open = useCart((s) => s.open);
  return (
    <button
      type="button"
      onClick={open}
      aria-label={t("cart", { count })}
      className="relative flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-paper"
    >
      <ShoppingBag className="size-[22px]" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 flex min-w-5 items-center justify-center rounded-full bg-kulhad px-1 text-xs leading-5 font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
