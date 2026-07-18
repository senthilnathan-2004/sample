import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";
import { trackSchema } from "@/lib/validate";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Guest order tracking: requires order number AND matching phone. Exposes only
 * tracking-relevant fields — no account data, no address, no other orders.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`track:${clientIp(req)}`, 20, 60 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter an order number and 10-digit phone." }, { status: 400 });

  await dbConnect();
  const order = await Order.findOne({
    orderNumber: parsed.data.orderNumber.trim().toUpperCase(),
    "customer.phone": parsed.data.phone,
  }).lean<OrderDoc>().exec();

  if (!order) {
    return NextResponse.json({ error: "No matching order found." }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    fulfillmentStatus: order.fulfillmentStatus,
    paymentStatus: order.paymentStatus,
    trackingNumber: order.trackingNumber,
    courierName: order.courierName,
    estimatedReadyBy: order.estimatedReadyBy,
    statusHistory: order.statusHistory.map((s) => ({ status: s.status, at: s.at, note: s.note })),
    items: order.items.map((i) => ({ name: i.name, quantity: i.quantity })),
  });
}
