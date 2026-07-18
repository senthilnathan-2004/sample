import { dbConnect } from "./db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { User } from "@/models/User";
import { Order, type OrderDoc } from "@/models/Order";

// Server-side fetchers for admin pages (already guarded by middleware + layout).

export async function adminListProducts() {
  await dbConnect();
  const rows = await Product.find().populate("category", "name").sort({ createdAt: -1 }).lean().exec();
  return rows.map((p) => ({
    id: String(p._id),
    name: p.name,
    category: (p.category as { name?: string })?.name ?? "",
    basePrice: p.basePrice,
    isActive: p.isActive,
    variants: p.variants?.length ?? 0,
  }));
}

export async function adminListCategories() {
  await dbConnect();
  const rows = await Category.find().sort({ sortOrder: 1, name: 1 }).lean().exec();
  return rows.map((c) => ({ id: String(c._id), name: c.name }));
}

// Registered customers with order count + lifetime value (read-only; no passwords).
export async function adminListCustomers(q?: string) {
  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(200).lean().exec();
  const ids = users.map((u) => u._id);
  const orders = await Order.find({ userId: { $in: ids } }).select("userId total fulfillmentStatus").lean<OrderDoc[]>().exec();
  const agg = new Map<string, { count: number; ltv: number }>();
  for (const o of orders) {
    if (o.fulfillmentStatus === "cancelled") continue;
    const k = String(o.userId);
    const cur = agg.get(k) ?? { count: 0, ltv: 0 };
    cur.count += 1;
    cur.ltv += o.total;
    agg.set(k, cur);
  }
  return users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    phone: u.phone,
    orders: agg.get(String(u._id))?.count ?? 0,
    ltv: agg.get(String(u._id))?.ltv ?? 0,
  }));
}

export async function adminCustomerDetail(id: string) {
  await dbConnect();
  const user = await User.findById(id).lean().exec();
  if (!user) return null;
  const orders = await Order.find({ userId: id }).sort({ createdAt: -1 }).lean<OrderDoc[]>().exec();
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    addresses: (user.addresses ?? []).map((a) => ({
      fullName: a.fullName,
      line1: a.line1,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      type: a.type,
    })),
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      total: o.total,
      status: o.fulfillmentStatus,
      createdAt: new Date(o.createdAt).toISOString(),
    })),
  };
}
