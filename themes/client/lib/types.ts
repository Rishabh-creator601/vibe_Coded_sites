export type Photo = { src: string; alt: string; width: number; height: number };

export type Cupping = {
  acidity: number;
  sweetness: number;
  body: number;
  aroma: number;
  finish: number;
};

export type Coffee = {
  id: string;
  name: string;
  region: string;
  altitude: number;
  process: string;
  /** 1 (lightest) to 5 (darkest) */
  roast: number;
  roastName: string;
  notes: string[];
  price: number;
  /** Key into Content.photos */
  image: string;
  description: string;
  cupping: Cupping;
};

export type Step = { day: string; time: string; title: string; body: string };

export type Content = {
  brand: {
    name: string;
    fullName: string;
    city: string;
    neighbourhood: string;
    since: number;
    email: string;
  };
  hero: { lines: string[]; lede: string };
  coffees: Coffee[];
  steps: Step[];
  story: { title: string; paragraphs: string[]; image: string; imageTwo: string };
  grinds: { id: string; label: string }[];
  batch: {
    kilos: number;
    bags: number;
    bagGrams: number;
    /** ISO date of the next roast */
    nextRoast: string;
    /** null when the database is offline: leave the count out */
    bagsLeft: number | null;
  };
  photos: Record<string, Photo>;
};

export type Reservation = {
  code: string;
  name: string;
  email: string;
  coffeeName: string;
  grindLabel: string;
  price: number;
  batchDate: string;
};
