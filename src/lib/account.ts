import { dbConnect } from "./db";
import { getSessionUserId } from "./auth";
import { User } from "@/models/User";
import { Order, type OrderDoc } from "@/models/Order";
import { Product } from "@/models/Product";

// Serializable shapes for account server components.
export type OrderSummaryDTO = {
  orderNumber: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  itemCount: number;
  firstItem: { name: string; image?: string } | null;
  items: { productId: string; name: string; variant: unknown; quantity: number; price: number }[];
};

export type OrderDetailDTO = OrderSummaryDTO & {
  customer: { name: string; phone: string; email?: string };
  shippingAddress: Record<string, unknown>;
  subtotal: number;
  discount: number;
  shipping: number;
  couponCode?: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedReadyBy?: string;
  statusHistory: { status: string; at: string; note?: string }[];
};

function summarize(o: OrderDoc): OrderSummaryDTO {
  return {
    orderNumber: o.orderNumber,
    createdAt: new Date(o.createdAt).toISOString(),
    total: o.total,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
    firstItem: o.items[0] ? { name: o.items[0].name } : null,
    items: o.items.map((i) => ({
      productId: String(i.productId),
      name: i.name,
      variant: i.variant,
      quantity: i.quantity,
      price: i.price,
    })),
  };
}

export function detail(o: OrderDoc): OrderDetailDTO {
  return {
    ...summarize(o),
    customer: o.customer,
    shippingAddress: o.shippingAddress,
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    couponCode: o.couponCode,
    trackingNumber: o.trackingNumber,
    courierName: o.courierName,
    estimatedReadyBy: o.estimatedReadyBy ? new Date(o.estimatedReadyBy).toISOString() : undefined,
    statusHistory: o.statusHistory.map((s) => ({
      status: s.status,
      at: new Date(s.at).toISOString(),
      note: s.note,
    })),
  };
}

/** Orders for the logged-in user, newest first. */
export async function getMyOrders(): Promise<OrderSummaryDTO[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];
  await dbConnect();
  const rows = await Order.find({ userId }).sort({ createdAt: -1 }).lean<OrderDoc[]>().exec();
  return rows.map(summarize);
}

/** A single order the logged-in user owns (by orderNumber), else null. */
export async function getMyOrder(orderNumber: string): Promise<OrderDetailDTO | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  await dbConnect();
  const o = await Order.findOne({ orderNumber, userId }).lean<OrderDoc>().exec();
  return o ? detail(o) : null;
}

export type BuyAgainItem = {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
};

/** Distinct still-available products from delivered orders — for Buy Again. */
export async function getBuyAgain(): Promise<BuyAgainItem[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];
  await dbConnect();
  const rows = await Order.find({ userId, fulfillmentStatus: "delivered" }).lean<OrderDoc[]>().exec();
  const ids = new Set<string>();
  for (const o of rows) for (const i of o.items) ids.add(String(i.productId));
  if (ids.size === 0) return [];

  const products = await Product.find({ _id: { $in: Array.from(ids) }, isActive: true })
    .select("name slug images basePrice")
    .lean()
    .exec();
  return products.map((p) => ({
    productId: String(p._id),
    name: p.name,
    slug: p.slug,
    image: p.images?.[0],
    price: p.basePrice,
  }));
}

/** Full profile + addresses for the logged-in user. */
export async function getMyAccount() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  await dbConnect();
  const user = await User.findById(userId).lean().exec();
  if (!user) return null;
  return {
    id: userId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    hasPassword: !!user.passwordHash,
    notificationPrefs: user.notificationPrefs,
    addresses: (user.addresses ?? []).map((a) => ({
      _id: String(a._id),
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      landmark: a.landmark,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      type: a.type,
      isDefault: a.isDefault,
    })),
    defaultAddressId: user.defaultAddressId ? String(user.defaultAddressId) : null,
  };
}
