"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export type MyReview = {
  id: string;
  productName: string;
  productSlug: string;
  rating: number;
  text: string;
  isApproved: boolean;
  createdAt: string;
};

export function MyReviewsList({ reviews }: { reviews: MyReview[] }) {
  const router = useRouter();

  async function del(id: string) {
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (!reviews.length) return <p className="text-muted">You haven&apos;t written any reviews yet.</p>;

  return (
    <ul className="grid gap-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-card border border-hairline p-4 shadow-card">
          <div className="flex items-center justify-between">
            <Link href={`/product/${r.productSlug}`} className="font-medium hover:text-brand">
              {r.productName}
            </Link>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                r.isApproved
                  ? "bg-[color:var(--success)]/10 text-success"
                  : "bg-[color:var(--warning)]/10 text-warning"
              }`}
            >
              {r.isApproved ? "Published" : "Pending approval"}
            </span>
          </div>
          <p className="mt-1 text-brand">{"★".repeat(r.rating)}</p>
          {r.text && <p className="mt-1 text-sm text-ink">{r.text}</p>}
          {!r.isApproved && (
            <button onClick={() => del(r.id)} className="mt-2 text-xs text-warning hover:underline">
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
