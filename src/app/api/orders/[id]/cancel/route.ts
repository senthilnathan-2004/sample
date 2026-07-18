import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Cancel own order — only while still pre-shipment (placed / in_progress).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await dbConnect();
  const order = await Order.findOne({ orderNumber: params.id }).exec();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(order.userId) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!["placed", "in_progress"].includes(order.fulfillmentStatus)) {
    return NextResponse.json({ error: "This order can no longer be cancelled." }, { status: 400 });
  }

  order.fulfillmentStatus = "cancelled";
  order.statusHistory.push({ status: "cancelled", at: new Date(), note: "Cancelled by customer" });
  await order.save();
  return NextResponse.json({ ok: true });
}
