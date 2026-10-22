import { getTranslations } from "next-intl/server";
import { OrderView } from "@/components/checkout/order-view";

export async function generateMetadata() {
  const t = await getTranslations("order");
  return { title: t("title"), robots: { index: false } };
}

// The order is read from this browser's storage, so the page itself is a static shell.
export default function OrderPage() {
  return <OrderView />;
}
