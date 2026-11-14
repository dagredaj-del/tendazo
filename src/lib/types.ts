export type Variant = {
  label: string; // "Talla", "Color", "Sabor"
  options: string[];
};

export type Store = {
  id: string;
  owner_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  city: string;
  zone: string | null;
  whatsapp: string;
  payment_methods: string[];
  ships_national: boolean;
  does_wholesale: boolean;
  opens_at: string | null;
  closes_at: string | null;
  is_active: boolean;
  trial_ends_at: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  price_retail: number;
  price_wholesale: number | null;
  wholesale_min_qty: number;
  variants: Variant[];
  tags: string[];
  price_before: number | null;
  is_available: boolean;
  created_at: string;
};

export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  selectedVariants: Record<string, string>; // { "Talla": "L" }
  note?: string;
};

export const CATEGORIES = [
  "Ropa",
  "Calzado",
  "Comida y repostería",
  "Belleza",
  "Tecnología",
  "Hogar",
  "Servicios locales",
  "Otros",
] as const;

export const PAYMENT_METHODS = [
  { id: "nequi", label: "Nequi" },
  { id: "daviplata", label: "Daviplata" },
  { id: "bancolombia", label: "Bancolombia" },
  { id: "efectivo", label: "Efectivo contraentrega" },
] as const;
