import { Schema, model, models, Types, type Model } from "mongoose";

/**
 * Product (spec §B5). Made-to-order business: `variant.stock === null` means
 * made-to-order (no stock count); a number means limited stock. `leadTimeDays`
 * drives the delivery estimate everywhere instead of a fake "in stock" badge.
 */
const VariantSchema = new Schema(
  {
    color: { type: String, required: true },
    size: String,
    customTextAllowed: { type: Boolean, default: false },
    priceDelta: { type: Number, default: 0 },
    stock: { type: Number, default: null }, // null = made-to-order
    sku: String,
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    description: { type: String, default: "" },
    care: String,
    images: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    compareAtPrice: Number, // struck MRP; drives discount %
    variants: { type: [VariantSchema], default: [] },
    leadTimeDays: { type: Number, default: 4 },
    isCustomizable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    isBestseller: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      ogImage: String,
    },
  },
  { timestamps: true },
);

// Full-text search over name/description/tags (Task 2.6 header + /search).
ProductSchema.index({ name: "text", description: "text", tags: "text" });

export interface ProductRaw {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: Types.ObjectId | { name: string; slug: string };
  description: string;
  care?: string;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  variants: {
    color: string;
    size?: string;
    customTextAllowed: boolean;
    priceDelta: number;
    stock: number | null;
    sku?: string;
  }[];
  leadTimeDays: number;
  isCustomizable: boolean;
  isActive: boolean;
  isBestseller: boolean;
  tags: string[];
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const Product: Model<ProductRaw> =
  (models.Product as Model<ProductRaw>) || model<ProductRaw>("Product", ProductSchema as never);
