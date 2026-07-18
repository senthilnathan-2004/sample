import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";
import { getSessionUserId } from "@/lib/auth";
import { detail } from "@/lib/account";

export const dynamic = "force-dynamic";

// Owner-scoped order detail by orderNumber. Only the owning user may read it.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await dbConnect();
  const order = await Order.findOne({ orderNumber: params.id }).lean<OrderDoc>().exec();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(order.userId) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ order: detail(order) });
}
