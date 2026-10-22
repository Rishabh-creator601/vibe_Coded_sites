"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/store/cart";

export function AddToCartButton({ slug, name, disabled, large }: { slug: string; name: string; disabled?: boolean; large?: boolean }) {
  const t = useTranslations("featured");
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(id);
  }, [added]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={t("addLabel", { name })}
        onClick={() => {
          add(slug);
          setAdded(true);
        }}
        className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
          large
            ? "min-h-12 bg-kulhad px-6 text-white hover:bg-kulhad-deep"
            : "min-h-11 border-[1.5px] border-roast px-4 text-sm hover:bg-roast hover:text-cream"
        } ${added && !large ? "border-leaf bg-leaf text-white hover:bg-leaf" : ""}`}
      >
        {added ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
        {added ? t("added") : t("add")}
      </button>
      <span role="status" className="sr-only">
        {added ? t("added") : ""}
      </span>
    </>
  );
}
