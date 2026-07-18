import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Filterable order list for the admin table.
export async function GET(req: Request) {
  const auth = await requireAdmin("staff");
  if (auth.response) return auth.response;

  const sp = new URL(req.url).searchParams;
  const status = sp.get("status");
  const q = sp.get("q");
  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.fulfillmentStatus = status;
  if (q) {
    filter.$or = [
      { orderNumber: { $regex: q, $options: "i" } },
      { "customer.phone": { $regex: q, $options: "i" } },
      { "customer.name": { $regex: q, $options: "i" } },
    ];
  }

  await dbConnect();
  const rows = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean<OrderDoc[]>().exec();
  return NextResponse.json({
    orders: rows.map((o) => ({
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      customer: o.customer,
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
    })),
  });
}
