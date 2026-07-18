import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const schema = z.object({ action: z.enum(["approve", "reject"]) });

/** Recompute a product's ratingAvg/ratingCount from its APPROVED reviews. */
async function recompute(productId: unknown) {
  const approved = await Review.find({ productId, isApproved: true }).select("rating").lean().exec();
  const count = approved.length;
  const avg = count ? approved.reduce((s, r) => s + r.rating, 0) / count : 0;
  await Product.updateOne(
    { _id: productId },
    { ratingCount: count, ratingAvg: Math.round(avg * 10) / 10 },
  ).exec();
}

// Approve (→ recompute product rating + reveal) or reject (delete) a review.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await dbConnect();
  const review = await Review.findById(params.id).exec();
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const productId = review.productId;
  if (parsed.data.action === "approve") {
    review.isApproved = true;
    await review.save();
  } else {
    await review.deleteOne();
  }
  await recompute(productId);

  const product = await Product.findById(productId).select("slug").lean().exec();
  if (product) revalidatePath(`/product/${product.slug}`);
  return NextResponse.json({ ok: true });
}
