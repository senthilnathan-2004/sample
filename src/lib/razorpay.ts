import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * Server-side Razorpay helpers. Keys are read lazily so the app still boots
 * for storefront-only development without Razorpay credentials configured.
 */
let client: Razorpay | null = null;

export function razorpayConfigured(): boolean {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function getRazorpay(): Razorpay {
  if (!razorpayConfigured()) {
    throw new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).");
  }
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

/** Create a Razorpay order. Amount is in paise. */
export async function createRazorpayOrder(amountInr: number, receipt: string) {
  const rp = getRazorpay();
  return rp.orders.create({
    amount: Math.round(amountInr * 100),
    currency: "INR",
    receipt,
    payment_capture: true,
  });
}

/**
 * Verify a webhook payload signature: HMAC-SHA256(rawBody, WEBHOOK_SECRET)
 * compared in constant time against the X-Razorpay-Signature header.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Verify the client-side checkout callback signature (order_id|payment_id). */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
