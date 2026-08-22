
export type Money = number;

export interface Media {
  id: string;
  url: string;
  alt: string;
  type: "image" | "video";
}

export interface OptionValue {
  id: string;
  label: string;
  swatch?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: OptionValue[];
}

export interface Variant {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: Money;
  compareAtPrice?: Money;
  stock: number;
  lowStockThreshold: number;
}

export interface ProductSection {
  title: string;
  content: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  collectionSlugs: string[];
  media: Media[];
  options: ProductOption[];
  variants: Variant[];
  sections: ProductSection[];
  faq: { question: string; answer: string }[];
  attributes: Record<string, string>;
  relatedSlugs: string[];
  addOnSlugs: string[];
  rating?: { average: number; count: number };
  isNew?: boolean;
  publishedAt: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  image: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  methods: ShippingMethod[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: Money;
  delay: string;
  freeAbove?: Money;
}

export type OrderStatus =
  | "en_attente_paiement"
  | "payee"
  | "en_preparation"
  | "expediee"
  | "livree"
  | "annulee"
  | "remboursee";

export interface CartLine {
  productSlug: string;
  variantId: string;
  quantity: number;
}

export interface CartQuoteLine {
  productSlug: string;
  variantId: string;
  name: string;
  variantLabel: string;
  image: string;
  unitPrice: Money;
  compareAtPrice?: Money;
  quantity: number;
  lineTotal: Money;
  availableStock: number;
}

export interface CartQuote {
  lines: CartQuoteLine[];
  subtotal: Money;
  discount: Money;
  shipping: Money | null;
  total: Money;
  currency: string;
  warnings: string[];
}
