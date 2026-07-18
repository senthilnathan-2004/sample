import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { createOrderSchema } from "@/lib/validate";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { getSessionUserId } from "@/lib/auth";
import { notify } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * Creates a COD order (placed / pending). Razorpay orders go through
 * /api/razorpay/create-order instead. Totals are always recomputed server-side.
 * Phase 4 attaches userId from the session; guests pass null.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`orders:${clientIp(req)}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.paymentMethod !== "cod") {
    return NextResponse.json(
      { error: "Use /api/razorpay/create-order for online payment" },
      { status: 400 },
    );
  }

  try {
    const userId = await getSessionUserId();
    const order = await createOrder(parsed.data, { userId });
    await notify.orderConfirmed(order); // COD confirmation
    return NextResponse.json({
      orderNumber: order.orderNumber,
      total: order.total,
      estimatedReadyBy: order.estimatedReadyBy,
    });
  } catch (err) {
    console.error("create COD order failed", err);
    const message = err instanceof Error ? err.message : "Could not place order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
