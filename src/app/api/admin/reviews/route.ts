import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Review, type ReviewDoc } from "@/models/Review";
import { Product } from "@/models/Product";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// List reviews (optionally only pending) with product name.
export async function GET(req: Request) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;

  const pending = new URL(req.url).searchParams.get("pending") === "1";
  await dbConnect();
  const filter = pending ? { isApproved: false } : {};
  const rows = await Review.find(filter).sort({ createdAt: -1 }).limit(200).lean<ReviewDoc[]>().exec();
  const products = await Product.find({ _id: { $in: rows.map((r) => r.productId) } })
    .select("name")
    .lean()
    .exec();
  const pmap = new Map(products.map((p) => [String(p._id), p.name]));

  return NextResponse.json({
    reviews: rows.map((r) => ({
      id: String(r._id),
      productName: pmap.get(String(r.productId)) ?? "Product",
      name: r.name,
      rating: r.rating,
      text: r.text,
      isApproved: r.isApproved,
      verifiedPurchase: r.verifiedPurchase,
      createdAt: r.createdAt,
    })),
  });
}
