import { NextResponse } from "next/server";
import { computeOrderTotals } from "@/lib/pricing";
import { couponValidateSchema } from "@/lib/validate";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Coupon preview: recomputes subtotal server-side, then applies the coupon.
export async function POST(req: Request) {
  const rl = rateLimit(`coupon:${clientIp(req)}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = couponValidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const totals = await computeOrderTotals(parsed.data.items, parsed.data.code);
    return NextResponse.json({
      valid: totals.discount > 0,
      discount: totals.discount,
      message: totals.couponMessage ?? "",
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
    });
  } catch (err) {
    console.error("coupon validate failed", err);
    return NextResponse.json({ error: "Could not validate coupon" }, { status: 400 });
  }
}
