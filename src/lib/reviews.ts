import { dbConnect } from "./db";
import { Review, type ReviewDoc } from "@/models/Review";
import { Order } from "@/models/Order";

export type ReviewDTO = {
  id: string;
  name: string;
  rating: number;
  text: string;
  photos: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
};

export type ReviewSummary = {
  reviews: ReviewDTO[];
  count: number;
  average: number;
  breakdown: Record<string, number>; // "5".."1" => count
};

/** Approved reviews for a product + rating breakdown (for the PDP). */
export async function getApprovedReviews(productId: string): Promise<ReviewSummary> {
  await dbConnect();
  const rows = await Review.find({ productId, isApproved: true })
    .sort({ createdAt: -1 })
    .lean<ReviewDoc[]>()
    .exec();

  const breakdown: Record<string, number> = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
  let sum = 0;
  for (const r of rows) {
    breakdown[String(r.rating)] = (breakdown[String(r.rating)] ?? 0) + 1;
    sum += r.rating;
  }
  return {
    reviews: rows.map((r) => ({
      id: String(r._id),
      name: r.name,
      rating: r.rating,
      text: r.text,
      photos: r.photos ?? [],
      verifiedPurchase: r.verifiedPurchase,
      helpfulCount: r.helpfulCount ?? 0,
      createdAt: new Date(r.createdAt).toISOString(),
    })),
    count: rows.length,
    average: rows.length ? Math.round((sum / rows.length) * 10) / 10 : 0,
    breakdown,
  };
}

/** True if this user has a delivered order containing the product. */
export async function hasVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
  await dbConnect();
  const order = await Order.findOne({
    userId,
    fulfillmentStatus: "delivered",
    "items.productId": productId,
  })
    .select("_id")
    .lean()
    .exec();
  return !!order;
}
