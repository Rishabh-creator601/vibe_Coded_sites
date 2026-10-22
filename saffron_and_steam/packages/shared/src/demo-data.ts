// Sample settings for the fictional café. The API's seed script will load this into
// MongoDB (phase 2); until then the web app reads it directly. The menu is in menu-data.ts.
// Translations are AI-drafted and not yet checked by native speakers.

import type { CafeSettings } from "./types";

const ALL_WEEK = [0, 1, 2, 3, 4, 5, 6];

export const demoSettings: CafeSettings = {
  cafeName: "Saffron & Steam",
  tagline: {
    en: "Breakfast, lunch, dinner and the perfect cup.",
    hi: "नाश्ता, दोपहर और रात का खाना, और लाजवाब चाय-कॉफ़ी।",
    bn: "সকালের জলখাবার, দুপুর আর রাতের খাবার, আর দারুণ এক কাপ চা-কফি।",
    mr: "न्याहारी, दुपारचं आणि रात्रीचं जेवण, आणि झकास चहा-कॉफी.",
    te: "టిఫిన్, మధ్యాహ్న భోజనం, రాత్రి భోజనం, ఇంకా అదిరిపోయే టీ-కాఫీ.",
  },
  address: {
    en: "123 Demo Street, Demo Nagar, Mumbai 400050",
    hi: "123 डेमो स्ट्रीट, डेमो नगर, मुंबई 400050",
    bn: "123 ডেমো স্ট্রিট, ডেমো নগর, মুম্বই 400050",
    mr: "123 डेमो स्ट्रीट, डेमो नगर, मुंबई 400050",
    te: "123 డెమో స్ట్రీట్, డెమో నగర్, ముంబై 400050",
  },
  phone: "+91 22 0000 0000",
  email: "hello@saffronandsteam.example",
  timezone: "Asia/Kolkata",
  openingHours: { start: "07:00", end: "23:00" },
  mealPeriods: [
    { key: "breakfast", start: "07:00", end: "11:00", days: ALL_WEEK },
    { key: "lunch", start: "12:00", end: "16:00", days: ALL_WEEK },
    { key: "dinner", start: "19:00", end: "23:00", days: ALL_WEEK },
  ],
  closures: [],
  taxPercent: 5,
  reservation: { slotMinutes: 30, maxCoversPerSlot: 20, maxPartySize: 10, bookingWindowDays: 30 },
  pickupLeadMinutes: 20,
  delivery: {
    enabled: true,
    zones: [
      { id: "a", name: "Zone A", pincodes: ["400050", "400051", "400052"], fee: 3000, minOrder: 19900, etaMinutes: 30 },
      { id: "b", name: "Zone B", pincodes: ["400053", "400054", "400055"], fee: 5000, minOrder: 29900, etaMinutes: 45 },
      { id: "c", name: "Zone C", pincodes: ["400056", "400057", "400058"], fee: 7000, minOrder: 39900, etaMinutes: 60 },
    ],
    freeDeliveryAbove: 50000,
    codEnabled: true,
    codMaxOrder: 200000,
  },
  offersBanner: {
    active: true,
    text: {
      en: "Happy hour: 15% off all coffee, 3 to 5 pm every day.",
      hi: "हैप्पी आवर: रोज़ दोपहर 3 से 5 बजे तक सभी कॉफ़ी पर 15% छूट।",
      bn: "হ্যাপি আওয়ার: প্রতিদিন বিকেল ৩টে থেকে ৫টা সব কফিতে ১৫% ছাড়।",
      mr: "हॅपी अवर: रोज दुपारी 3 ते 5 सर्व कॉफीवर 15% सूट.",
      te: "హ్యాపీ అవర్: ప్రతిరోజూ మధ్యాహ్నం 3 నుంచి 5 వరకు అన్ని కాఫీలపై 15% తగ్గింపు.",
    },
  },
};
