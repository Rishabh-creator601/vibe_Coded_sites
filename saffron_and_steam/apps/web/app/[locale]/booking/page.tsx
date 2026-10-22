import { getTranslations } from "next-intl/server";
import { BookingView } from "@/components/reserve/booking-view";

export async function generateMetadata() {
  const t = await getTranslations("booking");
  return { title: t("title"), robots: { index: false } };
}

// The booking is read from this browser's storage, so the page itself is a static shell.
export default function BookingPage() {
  return <BookingView />;
}
