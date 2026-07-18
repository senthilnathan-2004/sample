import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Review, type ReviewDoc } from "@/models/Review";
import { Product } from "@/models/Product";
import { MyReviewsList, type MyReview } from "@/components/account/MyReviewsList";

export const dynamic = "force-dynamic";

export default async function MyReviewsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/account/reviews");

  await dbConnect();
  const rows = await Review.find({ userId }).sort({ createdAt: -1 }).lean<ReviewDoc[]>().exec();
  const products = await Product.find({ _id: { $in: rows.map((r) => r.productId) } })
    .select("name slug")
    .lean()
    .exec();
  const pmap = new Map(products.map((p) => [String(p._id), p]));

  const reviews: MyReview[] = rows.map((r) => {
    const p = pmap.get(String(r.productId));
    return {
      id: String(r._id),
      productName: p?.name ?? "Product",
      productSlug: p?.slug ?? "",
      rating: r.rating,
      text: r.text,
      isApproved: r.isApproved,
      createdAt: new Date(r.createdAt).toISOString(),
    };
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/account" className="text-sm text-brand hover:underline">
        ← Your account
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-extrabold">Your reviews</h1>
      <div className="mt-6">
        <MyReviewsList reviews={reviews} />
      </div>
    </div>
  );
}
