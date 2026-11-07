export type User = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  count: number;
};

export type ProductColor = { name: string; hex: string };
export type ProductImage = { url: string; publicId: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  rate: number | null;
  colors: ProductColor[];
  images: ProductImage[];
  active: boolean;
  category: { id: string; name: string; slug: string } | null;
};

export type ProductPage = {
  products: Product[];
  total: number;
  page: number;
  pages: number;
};
