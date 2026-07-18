import type { ReviewDTO } from "@/lib/reviews";

function Stars({ n }: { n: number }) {
  return (
    <span className="text-brand" aria-label={`${n} stars`}>
      {"★".repeat(n)}
      <span className="text-hairline">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function getInitials(name: string) {
  return name.trim().charAt(0).toUpperCase() || "A";
}

export function ReviewList({ reviews }: { reviews: ReviewDTO[] }) {
  if (!reviews.length) return <p className="text-sm text-muted">No reviews yet. Be the first!</p>;
  return (
    <ul className="grid gap-6">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 font-heading font-bold text-brand">
              {getInitials(r.name)}
            </div>
            
            {/* Header */}
            <div className="flex flex-1 flex-col">
              <span className="font-heading font-semibold text-ink">{r.name}</span>
              <div className="mt-1 flex items-center gap-2">
                <Stars n={r.rating} />
                {r.verifiedPurchase && (
                  <span className="rounded-full bg-[color:var(--success)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                    Verified
                  </span>
                )}
              </div>
            </div>
            
            {/* Date */}
            <p className="shrink-0 text-xs text-muted">
              {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          
          {/* Body */}
          {r.text && (
            <p className="mt-4 text-sm leading-relaxed text-ink/80">
              {r.text}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
