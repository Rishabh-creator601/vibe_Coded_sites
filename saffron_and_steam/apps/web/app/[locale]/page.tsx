import { demoMenu, demoSettings, LOCALES, pick, type CafeSettings } from "@saffron/shared";
import { Featured } from "@/components/home/featured";
import { Hero } from "@/components/home/hero";
import { Story, Visit } from "@/components/home/story-and-visit";
import { WaysToOrder } from "@/components/home/ways-to-order";

// Phase 2 swaps the demo data for GET /api/v1/settings/public and /menu/featured.
const settings = demoSettings;
const featured = demoMenu.filter((i) => i.isFeatured);

/** schema.org data so search engines can show hours and address (PLAN.md section 12). */
function cafeJsonLd(s: CafeSettings) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: s.cafeName,
    description: pick(s.tagline, "en"),
    address: { "@type": "PostalAddress", streetAddress: "123 Demo Street, Demo Nagar", addressLocality: "Mumbai", postalCode: "400050", addressCountry: "IN" },
    telephone: s.phone,
    email: s.email,
    servesCuisine: ["Indian", "South Indian", "Bengali", "North Indian"],
    priceRange: "₹₹",
    acceptsReservations: true,
    availableLanguage: [...LOCALES],
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens: s.openingHours.start, closes: s.openingHours.end }],
  };
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cafeJsonLd(settings)).replace(/</g, "\\u003c") }} />
      <Hero settings={settings} />
      <Featured items={featured} settings={settings} />
      <WaysToOrder settings={settings} />
      <Story />
      <Visit settings={settings} />
    </>
  );
}
