import { z } from "zod";

// Shared zod schemas for API input validation (server-side).

export const addressSchema = z.object({
  fullName: z.string().min(2).max(80),
  phone: z.string().regex(/^\d{10}$/, "Enter a 10-digit phone number"),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional().or(z.literal("")),
  landmark: z.string().max(80).optional().or(z.literal("")),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
  type: z.enum(["home", "work"]).default("home"),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  variant: z.object({ color: z.string().default(""), size: z.string().optional() }),
  quantity: z.number().int().min(1).max(99),
  customText: z.string().max(48).optional(),
});

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2).max(80),
    phone: z.string().regex(/^\d{10}$/),
    email: z.string().email().optional().or(z.literal("")),
  }),
  shippingAddress: addressSchema,
  items: z.array(checkoutItemSchema).min(1),
  couponCode: z.string().max(32).optional().or(z.literal("")),
  paymentMethod: z.enum(["razorpay", "cod"]),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1).max(32),
  items: z.array(checkoutItemSchema).min(1),
});

export const trackSchema = z.object({
  orderNumber: z.string().min(3).max(40),
  phone: z.string().regex(/^\d{10}$/),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const otpSendSchema = z.object({
  identifier: z.string().min(3).max(120),
  purpose: z.enum(["login", "verify", "reset"]),
});

export const otpVerifySchema = z.object({
  identifier: z.string().min(3).max(120),
  code: z.string().regex(/^\d{6}$/),
  purpose: z.enum(["login", "verify", "reset"]),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional().or(z.literal("")),
  name: z.string().min(2).max(80).optional(),
});

export const notificationPrefsSchema = z.object({
  whatsapp: z.boolean(),
  email: z.boolean(),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(72),
});

export const adminVariantSchema = z.object({
  color: z.string().min(1),
  size: z.string().optional().or(z.literal("")),
  customTextAllowed: z.boolean().default(false),
  priceDelta: z.number().default(0),
  stock: z.number().nullable().default(null),
  sku: z.string().optional().or(z.literal("")),
});

export const adminProductSchema = z.object({
  name: z.string().min(2).max(140),
  slug: z.string().max(160).optional().or(z.literal("")),
  category: z.string().min(1),
  description: z.string().max(4000).optional().or(z.literal("")),
  care: z.string().max(1000).optional().or(z.literal("")),
  images: z.array(z.string()).default([]),
  basePrice: z.number().min(0),
  compareAtPrice: z.number().min(0).optional().nullable(),
  variants: z.array(adminVariantSchema).default([]),
  leadTimeDays: z.number().int().min(0).max(90).default(4),
  isCustomizable: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().max(90).optional().or(z.literal("")),
  icon: z.string().max(8).optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const adminCouponSchema = z.object({
  code: z.string().min(2).max(32),
  type: z.enum(["percentage", "flat"]),
  value: z.number().min(0),
  expiry: z.string().optional().or(z.literal("")),
  minOrderValue: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const adminUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72).optional().or(z.literal("")),
  role: z.enum(["owner", "manager", "staff"]),
  isActive: z.boolean().default(true),
});

export const customOrderSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^\d{10}$/),
  email: z.string().email().optional().or(z.literal("")),
  description: z.string().min(5).max(2000),
  colorPreference: z.string().max(120).optional().or(z.literal("")),
  budget: z.string().max(60).optional().or(z.literal("")),
  referenceImages: z.array(z.string()).default([]),
});

export const orderStatusSchema = z.object({
  fulfillmentStatus: z.enum(["placed", "in_progress", "ready", "shipped", "delivered", "cancelled"]),
  trackingNumber: z.string().max(60).optional().or(z.literal("")),
  courierName: z.string().max(60).optional().or(z.literal("")),
  note: z.string().max(200).optional().or(z.literal("")),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
export { slugify };

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
