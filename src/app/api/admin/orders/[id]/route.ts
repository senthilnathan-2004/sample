import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { requireAdmin } from "@/lib/adminAuth";
import { orderStatusSchema } from "@/lib/validate";
import { notify } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * Advance an order's fulfillment status. Advancing to "shipped" REQUIRES a
 * tracking number + courier name (server-enforced gate). Records statusHistory.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin("staff");
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { fulfillmentStatus, trackingNumber, courierName, note } = parsed.data;

  if (fulfillmentStatus === "shipped" && (!trackingNumber?.trim() || !courierName?.trim())) {
    return NextResponse.json(
      { error: "Tracking number and courier are required to mark an order shipped." },
      { status: 400 },
    );
  }

  await dbConnect();
  const order = await Order.findOne({ orderNumber: params.id }).exec();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  order.fulfillmentStatus = fulfillmentStatus;
  if (fulfillmentStatus === "shipped") {
    order.trackingNumber = trackingNumber!.trim();
    order.courierName = courierName!.trim();
  }
  order.statusHistory.push({
    status: fulfillmentStatus,
    at: new Date(),
    note: note || (fulfillmentStatus === "shipped" ? `${courierName} · ${trackingNumber}` : undefined),
  });
  await order.save();

  if (fulfillmentStatus === "shipped") await notify.orderShipped(order);
  else if (fulfillmentStatus === "delivered") await notify.orderDelivered(order);
  return NextResponse.json({ ok: true });
}
