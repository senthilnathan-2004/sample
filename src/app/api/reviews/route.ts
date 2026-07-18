import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Review } from "@/models/Review";
import { User } from "@/models/User";
import { reviewSchema } from "@/lib/validate";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { getSessionUserId } from "@/lib/auth";
import { hasVerifiedPurchase, getApprovedReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

// GET approved reviews for a product.
export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  const summary = await getApprovedReviews(productId);
  return NextResponse.json(summary);
}

/**
 * Submit a review. Defaults to unapproved (hidden until an admin approves).
 * verifiedPurchase is set when the logged-in reviewer has a delivered order with
 * the product. Guests may review with a name; logged-in users use their account name.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`review:${clientIp(req)}`, 10, 60 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });

  await dbConnect();
  const userId = await getSessionUserId();

  let name = parsed.data.name?.trim();
  let verifiedPurchase = false;
  if (userId) {
    const user = await User.findById(userId).select("name").lean().exec();
    name = user?.name ?? name;
    verifiedPurchase = await hasVerifiedPurchase(userId, parsed.data.productId);
  }
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  await Review.create({
    productId: parsed.data.productId,
    userId: userId ?? null,
    name,
    rating: parsed.data.rating,
    text: parsed.data.text || "",
    isApproved: false,
    verifiedPurchase,
  });

  return NextResponse.json({ ok: true, message: "Thanks! Your review will appear once approved." });
}
