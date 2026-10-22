import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20">
      <h1 className="max-w-2xl text-4xl leading-tight sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-xl text-lg text-roast-soft">{t("body")}</p>
      <Link href="/" className="btn btn-primary mt-8">
        {t("back")}
      </Link>
    </section>
  );
}
