import { ReviewsAdmin } from "@/components/admin/ReviewsAdmin";

export const dynamic = "force-dynamic";

export default function AdminReviews() {
  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-extrabold">Reviews</h1>
      <ReviewsAdmin />
    </div>
  );
}
