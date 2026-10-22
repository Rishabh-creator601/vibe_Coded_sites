import { getTranslations } from "next-intl/server";
import { demoSettings } from "@saffron/shared";
import { MenuBrowser } from "@/components/menu/menu-browser";

export async function generateMetadata() {
  const t = await getTranslations("menuPage");
  return { title: t("title") };
}

export default function MenuPage() {
  return <MenuBrowser settings={demoSettings} />;
}
