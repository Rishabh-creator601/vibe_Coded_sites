// Shapes shared by the web app and the API. They mirror the MongoDB
// collections in PLAN.md section 7.

export const LOCALES = ["en", "hi", "bn", "mr", "te"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Text stored once per language. `en` is required; the others fall back to it. */
export type Localized = { en: string } & Partial<Record<Exclude<Locale, "en">, string>>;

export type MealPeriodKey = "breakfast" | "lunch" | "dinner";
export type Availability = MealPeriodKey | "allDay";

export type Diet = "veg" | "nonVeg" | "vegan" | "egg";
export const CUISINES = ["indian", "italian", "american", "japanese", "french"] as const;
export type Cuisine = (typeof CUISINES)[number];
export type ItemTag = "glutenFree" | "chefSpecial" | "bestseller" | "new";

export interface PhotoCredit {
  author: string;
  license: string;
  source: "Pexels" | "Wikimedia Commons";
  href: string;
}

export interface MenuImage {
  url: string;
  alt: Localized;
  /** Photo credit, shown on the /credits page. */
  credit?: PhotoCredit;
}

export interface Variant {
  name: Localized;
  /** Paise added to the base price. */
  priceDelta: number;
}

export interface AddOn {
  name: Localized;
  /** Paise. */
  price: number;
}

export interface MenuItem {
  slug: string;
  category: CategorySlug;
  cuisine: Cuisine;
  name: Localized;
  description: Localized;
  /** Paise: ₹249.00 is 24900. */
  price: number;
  images: MenuImage[];
  availableIn: Availability[];
  diet: Diet;
  tags: ItemTag[];
  allergens: string[];
  /** 0 (none) to 3 (hot). */
  spiceLevel: 0 | 1 | 2 | 3;
  variants: Variant[];
  addOns: AddOn[];
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export type CategorySlug = "breakfast" | "lunch" | "dinner" | "tea-coffee" | "desserts";

export interface Category {
  slug: CategorySlug;
  name: Localized;
  mealPeriod: MealPeriodKey | "allDay";
  sortOrder: number;
}

export interface MealPeriod {
  key: MealPeriodKey;
  /** "07:00", café local time. */
  start: string;
  end: string;
  /** 0 = Sunday … 6 = Saturday. */
  days: number[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  pincodes: string[];
  /** Paise. */
  fee: number;
  /** Paise. */
  minOrder: number;
  etaMinutes: number;
}

export interface CafeSettings {
  cafeName: string;
  tagline: Localized;
  address: Localized;
  phone: string;
  /** WhatsApp number with country code and no "+", as wa.me links need it: "919876543210". */
  whatsapp: string;
  email: string;
  timezone: string;
  /** Opening and closing for tea, coffee and desserts. */
  openingHours: { start: string; end: string };
  mealPeriods: MealPeriod[];
  closures: { date: string; reason: Localized }[];
  taxPercent: number;
  reservation: { slotMinutes: number; maxCoversPerSlot: number; maxPartySize: number; bookingWindowDays: number };
  pickupLeadMinutes: number;
  delivery: {
    enabled: boolean;
    zones: DeliveryZone[];
    /** Paise. */
    freeDeliveryAbove: number;
    codEnabled: boolean;
    /** Paise. */
    codMaxOrder: number;
  };
  offersBanner: { text: Localized; active: boolean };
}
