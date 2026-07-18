import { cn } from "@/lib/cn";

// Flipkart-style rating chip: magenta-tint bg, magenta text, "4.5 ★".
export function RatingPill({ rating, className }: { rating: number; className?: string }) {
  if (!rating) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded bg-brand-tint px-1.5 py-0.5 text-xs font-semibold text-brand",
        className,
      )}
    >
      {rating.toFixed(1)} <span aria-hidden>★</span>
    </span>
  );
}
