"use client";

import type { SortKey } from "@/types";
import { cn } from "@/lib/cn";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "popularity", label: "Popularity" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  { key: "newest", label: "Newest" },
  { key: "rating", label: "Rating" },
  { key: "discount", label: "Discount" },
];

export function SortBar({
  sort,
  view,
  total,
  onSort,
  onView,
}: {
  sort: SortKey;
  view: "grid" | "list";
  total: number;
  onSort: (s: SortKey) => void;
  onView: (v: "grid" | "list") => void;
}) {
  return (
    <div className="border-b border-hairline pb-3">
      {/* Row 1: result count + view toggle (desktop) */}
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-sm text-muted">{total} results</span>
        <div className="hidden overflow-hidden rounded-control border border-hairline lg:flex">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              aria-pressed={view === v}
              className={cn(
                "px-3 py-1.5 text-sm font-medium capitalize",
                view === v ? "bg-brand text-white" : "bg-white text-ink hover:bg-brand-tint",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: sort chips (horizontal scroll on small screens) */}
      <div className="no-scrollbar mt-2 flex items-center gap-1.5 overflow-x-auto">
        <span className="hidden shrink-0 self-center text-sm text-muted sm:inline">Sort by:</span>
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => onSort(o.key)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              sort === o.key
                ? "border-brand bg-brand-tint text-brand"
                : "border-hairline bg-white text-ink hover:bg-brand-tint-strong",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
