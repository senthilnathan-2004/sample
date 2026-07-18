import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { createOrderSchema } from "@/lib/validate";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";
import { Order } from "@/models/Order";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Creates the DB order (placed / pending) with server-recomputed totals, then a
 * Razorpay order, and returns the public key + rz order id for Checkout.
 * The order is NEVER marked paid here — only the signature-verified webhook does that.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`rzp-create:${clientIp(req)}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (!razorpayConfigured()) {
    return NextResponse.json(
      { error: "Online payment is not available right now. Please choose Cash on Delivery." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success || parsed.data.paymentMethod !== "razorpay") {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  try {
    const userId = await getSessionUserId();
    const order = await createOrder(parsed.data, { userId });
    const rzOrder = await createRazorpayOrder(order.total, order.orderNumber);

    await Order.updateOne({ _id: order._id }, { razorpayOrderId: rzOrder.id }).exec();

    return NextResponse.json({
      orderNumber: order.orderNumber,
      razorpayOrderId: rzOrder.id,
      amount: rzOrder.amount,
      currency: rzOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      customer: order.customer,
    });
  } catch (err) {
    console.error("razorpay create-order failed", err);
    const message = err instanceof Error ? err.message : "Could not start payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
