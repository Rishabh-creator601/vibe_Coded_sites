import { getTranslations } from "next-intl/server";
import { demoSettings } from "@saffron/shared";
import { ReserveForm } from "@/components/reserve/reserve-form";

export async function generateMetadata() {
  const t = await getTranslations("reserveForm");
  return { title: t("title") };
}

export default async function ReservePage() {
  const t = await getTranslations("reserveForm");
  return (
    <div className="container-page pt-10 pb-20 lg:pt-14">
      <h1 className="text-5xl leading-tight sm:text-6xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-roast-soft">{t("intro")}</p>
      <ReserveForm settings={demoSettings} />
    </div>
  );
}
