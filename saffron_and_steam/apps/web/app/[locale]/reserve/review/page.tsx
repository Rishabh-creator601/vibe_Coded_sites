import { getTranslations } from "next-intl/server";
import { demoSettings } from "@saffron/shared";
import { ReviewBooking } from "@/components/reserve/review-booking";

export async function generateMetadata() {
  const t = await getTranslations("reviewBooking");
  return { title: t("title"), robots: { index: false } };
}

export default async function ReviewPage() {
  const t = await getTranslations("reviewBooking");
  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <h1 className="text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
      <ReviewBooking settings={demoSettings} />
    </div>
  );
}
