import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { dbConnect } from "@/lib/db";
import { Order } from "@/models/Order";
import { notify } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — the ONLY place an order is marked paid. Verifies the
 * X-Razorpay-Signature HMAC over the raw body before touching the DB. Invalid
 * signatures are rejected + logged. Handles `payment.captured` and `payment.failed`.
 */
export async function POST(req: Request) {
  const raw = await req.text(); // raw body required for signature verification
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(raw, signature)) {
    console.warn("Razorpay webhook: INVALID signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await dbConnect();
  const payment = event.payload?.payment?.entity;
  const rzOrderId = payment?.order_id;

  if (event.event === "payment.captured" && rzOrderId) {
    const order = await Order.findOne({ razorpayOrderId: rzOrderId }).exec();
    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.razorpayPaymentId = payment?.id;
      order.statusHistory.push({ status: "placed", at: new Date(), note: "Payment received" });
      await order.save();
      await notify.orderConfirmed(order);
      console.log(`Order ${order.orderNumber} marked PAID via webhook`);
    }
  } else if (event.event === "payment.failed" && rzOrderId) {
    await Order.updateOne(
      { razorpayOrderId: rzOrderId, paymentStatus: { $ne: "paid" } },
      { paymentStatus: "failed" },
    ).exec();
  }

  return NextResponse.json({ received: true });
}
