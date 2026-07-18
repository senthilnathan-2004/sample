// Shared UI/domain types. Model-backed types live alongside their Mongoose
// schemas in later phases; these are the cross-cutting shapes used by the
// layout shell and CMS reader.

export type NavLink = {
  label: string;
  href: string;
};

export type CategoryLink = {
  name: string;
  slug: string;
  icon?: string;
  image?: string;
};

export type FooterColumn = {
  title: string;
  links: NavLink[];
};

export type AnnouncementBar = {
  text: string;
  active: boolean;
};

export type Branding = {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  social: { label: string; href: string }[];
};

export type SeoDefaults = {
  title: string;
  description: string;
  ogImage?: string;
};

export type Commerce = {
  currency: string;
  shippingFlatRate: number;
  freeShippingThreshold: number;
  defaultLeadTime: number;
  codEnabled: boolean;
  whatsappNumber?: string;
  businessAddress?: string;
  gstNumber?: string;
};

// ── Catalog DTOs (plain serializable shapes passed to client components) ──

export type VariantDTO = {
  color: string;
  size?: string;
  customTextAllowed: boolean;
  priceDelta: number;
  stock: number | null; // null = made-to-order
  sku?: string;
};

export type ProductDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  care?: string;
  category: { name: string; slug: string };
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  discountPct: number; // computed; 0 when no compareAtPrice
  variants: VariantDTO[];
  leadTimeDays: number;
  isCustomizable: boolean;
  isBestseller: boolean;
  tags: string[];
  ratingAvg: number;
  ratingCount: number;
};

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
  sortOrder: number;
};

export type SortKey = "popularity" | "price-asc" | "price-desc" | "newest" | "rating" | "discount";

export type FacetCounts = {
  categories: Record<string, number>;
  colors: Record<string, number>;
  ratings: Record<string, number>; // "4","3","2","1" => count of products with ratingAvg >= key
  priceMin: number;
  priceMax: number;
};

export type ProductQueryResult = {
  items: ProductDTO[];
  total: number;
  facetCounts: FacetCounts;
  page: number;
  pageSize: number;
};

// ── Cart / wishlist / recently-viewed ──

export type CartItem = {
  key: string; // productId + variant signature + customText — identifies a line
  productId: string;
  slug: string;
  name: string;
  image?: string;
  variant: { color: string; size?: string };
  unitPrice: number;
  quantity: number;
  leadTimeDays: number;
  customText?: string;
};

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  price: number;
};

export type RecentItem = {
  slug: string;
  name: string;
  image?: string;
  at: number;
};

export type SettingsShape = {
  branding: Branding;
  commerce: Commerce;
  announcementBar: AnnouncementBar;
  footer: {
    columns: FooterColumn[];
    contactInfo: string;
    copyright: string;
  };
  seoDefaults: SeoDefaults;
};
