import { dbConnect } from "./db";
import { Product } from "@/models/Product";
import { Coupon } from "@/models/Coupon";
import { getSettings } from "./settings";

// Client sends only identifiers + quantity; prices are resolved from the DB.
export type CheckoutItemInput = {
  productId: string;
  variant: { color: string; size?: string };
  quantity: number;
  customText?: string;
};

export type OrderLine = {
  productId: string;
  name: string;
  variant: { color: string; size?: string };
  quantity: number;
  price: number; // server-resolved unit price
  customText?: string;
};

export type OrderTotals = {
  items: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  couponMessage?: string;
};

export type CouponValidation = {
  valid: boolean;
  discount: number;
  message: string;
};

/** Validate a coupon against a subtotal. Server-authoritative. */
export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponValidation> {
  await dbConnect();
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true }).lean().exec();
  if (!coupon) return { valid: false, discount: 0, message: "Invalid coupon code." };
  if (coupon.expiry && new Date(coupon.expiry) < new Date())
    return { valid: false, discount: 0, message: "This coupon has expired." };
  if (subtotal < (coupon.minOrderValue ?? 0))
    return {
      valid: false,
      discount: 0,
      message: `Minimum order of ₹${coupon.minOrderValue} required.`,
    };

  const discount =
    coupon.type === "percentage"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);
  return { valid: true, discount, message: `Coupon applied — you saved ₹${discount}.` };
}

/**
 * Recompute the full order total server-side from DB prices + settings. Never
 * trust client-provided prices, discounts, or shipping. Returns resolved lines
 * and a breakdown; throws if the cart is empty or references unknown products.
 */
export async function computeOrderTotals(
  inputItems: CheckoutItemInput[],
  couponCode?: string,
): Promise<OrderTotals> {
  await dbConnect();
  if (!inputItems.length) throw new Error("Cart is empty.");

  const ids = inputItems.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids }, isActive: true }).lean().exec();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items: OrderLine[] = [];
  for (const input of inputItems) {
    const product = byId.get(input.productId);
    if (!product) throw new Error(`Product not found: ${input.productId}`);
    const variant = product.variants.find(
      (v) =>
        v.color === input.variant.color &&
        (input.variant.size ? v.size === input.variant.size : true),
    );
    const unitPrice = product.basePrice + (variant?.priceDelta ?? 0);
    const quantity = Math.max(1, Math.floor(input.quantity));
    items.push({
      productId: String(product._id),
      name: product.name,
      variant: { color: input.variant.color, size: input.variant.size },
      quantity,
      price: unitPrice,
      customText: input.customText,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discount = 0;
  let appliedCode: string | undefined;
  let couponMessage: string | undefined;
  if (couponCode) {
    const v = await validateCoupon(couponCode, subtotal);
    couponMessage = v.message;
    if (v.valid) {
      discount = v.discount;
      appliedCode = couponCode.toUpperCase().trim();
    }
  }

  const { commerce } = await getSettings();
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping =
    afterDiscount <= 0 || afterDiscount >= commerce.freeShippingThreshold
      ? 0
      : commerce.shippingFlatRate;
  const total = afterDiscount + shipping;

  return { items, subtotal, discount, shipping, total, couponCode: appliedCode, couponMessage };
}

/** Slowest lead time across the cart (drives est. ready-by). */
export async function maxLeadTime(inputItems: CheckoutItemInput[]): Promise<number> {
  await dbConnect();
  const ids = inputItems.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids } }).select("leadTimeDays").lean().exec();
  return products.reduce((m, p) => Math.max(m, p.leadTimeDays ?? 4), 0) || 4;
}
