import { dbConnect } from "./db";
import { Order, type OrderDoc } from "@/models/Order";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export type Analytics = {
  stats: { todayOrders: number; todayRevenue: number; pending: number; delivered: number };
  revenueByDay: { date: string; revenue: number }[];
  ordersByDay: { date: string; orders: number }[];
  topProducts: { name: string; qty: number }[];
  salesByCategory: { name: string; revenue: number }[];
  paymentSplit: { method: string; count: number }[];
  newVsReturning: { type: string; count: number }[];
};

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** First-party analytics computed from order data (in JS — fine at this scale). */
export async function getAnalytics(days = 14): Promise<Analytics> {
  await dbConnect();
  const orders = await Order.find().lean<OrderDoc[]>().exec();
  const products = await Product.find().select("_id name category").lean().exec();
  const categories = await Category.find().select("_id name").lean().exec();
  const catName = new Map(categories.map((c) => [String(c._id), c.name]));
  const prodCat = new Map(products.map((p) => [String(p._id), String(p.category)]));

  const now = new Date();
  const todayKey = dayKey(now);
  const isPaidLike = (o: OrderDoc) => o.paymentStatus === "paid" || o.paymentMethod === "cod";

  // Stat cards
  let todayOrders = 0;
  let todayRevenue = 0;
  let pending = 0;
  let delivered = 0;
  for (const o of orders) {
    if (dayKey(new Date(o.createdAt)) === todayKey) {
      todayOrders += 1;
      if (isPaidLike(o) && o.fulfillmentStatus !== "cancelled") todayRevenue += o.total;
    }
    if (["placed", "in_progress", "ready"].includes(o.fulfillmentStatus)) pending += 1;
    if (o.fulfillmentStatus === "delivered") delivered += 1;
  }

  // Time series (last N days)
  const dayList: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayList.push(dayKey(d));
  }
  const revMap = new Map(dayList.map((d) => [d, 0]));
  const ordMap = new Map(dayList.map((d) => [d, 0]));
  for (const o of orders) {
    const k = dayKey(new Date(o.createdAt));
    if (ordMap.has(k)) {
      ordMap.set(k, (ordMap.get(k) ?? 0) + 1);
      if (isPaidLike(o) && o.fulfillmentStatus !== "cancelled")
        revMap.set(k, (revMap.get(k) ?? 0) + o.total);
    }
  }
  const shortDate = (k: string) =>
    new Date(k).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  // Top products + sales by category
  const prodQty = new Map<string, number>();
  const catRev = new Map<string, number>();
  for (const o of orders) {
    if (o.fulfillmentStatus === "cancelled") continue;
    for (const it of o.items) {
      prodQty.set(it.name, (prodQty.get(it.name) ?? 0) + it.quantity);
      const cid = prodCat.get(String(it.productId));
      const cname = cid ? catName.get(cid) ?? "Other" : "Other";
      catRev.set(cname, (catRev.get(cname) ?? 0) + it.price * it.quantity);
    }
  }

  // Payment split + new vs returning
  const payMap = new Map<string, number>();
  const userOrderCount = new Map<string, number>();
  for (const o of orders) {
    payMap.set(o.paymentMethod, (payMap.get(o.paymentMethod) ?? 0) + 1);
    if (o.userId) {
      const uid = String(o.userId);
      userOrderCount.set(uid, (userOrderCount.get(uid) ?? 0) + 1);
    }
  }
  let newCust = 0;
  let returning = 0;
  for (const count of userOrderCount.values()) count > 1 ? returning++ : newCust++;

  return {
    stats: { todayOrders, todayRevenue, pending, delivered },
    revenueByDay: dayList.map((d) => ({ date: shortDate(d), revenue: revMap.get(d) ?? 0 })),
    ordersByDay: dayList.map((d) => ({ date: shortDate(d), orders: ordMap.get(d) ?? 0 })),
    topProducts: Array.from(prodQty.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty })),
    salesByCategory: Array.from(catRev.entries()).map(([name, revenue]) => ({ name, revenue })),
    paymentSplit: Array.from(payMap.entries()).map(([method, count]) => ({
      method: method === "cod" ? "COD" : "Online",
      count,
    })),
    newVsReturning: [
      { type: "New", count: newCust },
      { type: "Returning", count: returning },
    ],
  };
}
