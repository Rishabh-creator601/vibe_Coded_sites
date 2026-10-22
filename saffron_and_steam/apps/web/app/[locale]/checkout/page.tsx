import { getTranslations } from "next-intl/server";
import { demoSettings } from "@saffron/shared";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export async function generateMetadata() {
  const t = await getTranslations("checkout");
  return { title: t("title"), robots: { index: false } };
}

export default async function CheckoutPage() {
  const t = await getTranslations("checkout");
  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <h1 className="text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
      <CheckoutForm settings={demoSettings} />
    </div>
  );
}
