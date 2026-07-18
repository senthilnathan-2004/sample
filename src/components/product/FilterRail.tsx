"use client";

import type { CategoryDTO, FacetCounts } from "@/types";
import type { ProductFilters } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";

// Named color → swatch hex (best-effort; unknown names get a neutral ring).
const SWATCH: Record<string, string> = {
  White: "#ffffff",
  Cream: "#f5efe3",
  Yellow: "#f4c430",
  Orange: "#e8863b",
  Pink: "#f3a6c4",
  "Blush Pink": "#f3ccd8",
  Red: "#d23b3b",
  Green: "#5fa463",
  Mint: "#bfe3cf",
  Grey: "#9aa0a6",
  "Sky Blue": "#8ec5e8",
  Lavender: "#c9b6e4",
  Purple: "#8e5bb5",
  Multicolor: "#d2388d",
  Pastel: "#f1d9ea",
  "Pastel Mix": "#f1d9ea",
  "Earth Tones": "#b08968",
};

type Props = {
  facetCounts: FacetCounts;
  categories: CategoryDTO[];
  filters: ProductFilters;
  lockedCategory?: string; // hide category selector on /shop/[category]
  onChange: (patch: Partial<ProductFilters>) => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-hairline py-4">
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      {children}
    </div>
  );
}

const PRICE_RANGES = [
  { label: "Under ₹250", min: 0, max: 250 },
  { label: "₹250 – ₹500", min: 250, max: 500 },
  { label: "₹500 – ₹1000", min: 500, max: 1000 },
  { label: "Over ₹1000", min: 1000, max: undefined },
];

export function FilterRail({ facetCounts, categories, filters, lockedCategory, onChange }: Props) {
  const colorEntries = Object.entries(facetCounts.colors).sort((a, b) => b[1] - a[1]);

  const toggleColor = (color: string) => {
    const set = new Set(filters.colors ?? []);
    if (set.has(color)) set.delete(color);
    else set.add(color);
    onChange({ colors: Array.from(set), page: 1 });
  };

  return (
    <div className="text-sm">
      {!lockedCategory && (
        <Section title="Category">
          <ul className="grid gap-1">
            <li>
              <button
                onClick={() => onChange({ category: undefined, page: 1 })}
                className={cn(
                  "flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-brand-tint",
                  !filters.category && "font-semibold text-brand",
                )}
              >
                All categories
              </button>
            </li>
            {categories.map((c) => {
              const count = facetCounts.categories[c.slug] ?? 0;
              return (
                <li key={c.slug}>
                  <button
                    onClick={() => onChange({ category: c.slug, page: 1 })}
                    className={cn(
                      "flex w-full items-center justify-between rounded px-2 py-1.5 text-left hover:bg-brand-tint",
                      filters.category === c.slug && "font-semibold text-brand",
                    )}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-muted">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Section title="Price">
        <ul className="grid gap-1">
          {PRICE_RANGES.map((r) => {
            const active = filters.minPrice === r.min && filters.maxPrice === r.max;
            return (
              <li key={r.label}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-brand-tint">
                  <input
                    type="radio"
                    name="price"
                    checked={active}
                    onChange={() => onChange({ minPrice: r.min, maxPrice: r.max, page: 1 })}
                    className="accent-brand"
                  />
                  <span className={cn(active && "font-semibold text-brand")}>{r.label}</span>
                </label>
              </li>
            );
          })}
          {(filters.minPrice != null || filters.maxPrice != null) && (
            <li>
              <button
                onClick={() => onChange({ minPrice: undefined, maxPrice: undefined, page: 1 })}
                className="px-2 py-1 text-xs text-brand hover:underline"
              >
                Clear price
              </button>
            </li>
          )}
        </ul>
        <p className="mt-1 px-2 text-xs text-muted">
          Range {formatINR(facetCounts.priceMin)} – {formatINR(facetCounts.priceMax)}
        </p>
      </Section>

      {colorEntries.length > 0 && (
        <Section title="Colour">
          <div className="grid gap-1">
            {colorEntries.map(([color, count]) => {
              const active = filters.colors?.includes(color);
              return (
                <label
                  key={color}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-brand-tint"
                >
                  <input
                    type="checkbox"
                    checked={!!active}
                    onChange={() => toggleColor(color)}
                    className="accent-brand"
                  />
                  <span
                    aria-hidden
                    className="inline-block h-4 w-4 rounded-full border border-hairline"
                    style={{ background: SWATCH[color] ?? "#e9e2dc" }}
                  />
                  <span className={cn("flex-1", active && "font-semibold text-brand")}>{color}</span>
                  <span className="text-xs text-muted">{count}</span>
                </label>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Customer rating">
        <ul className="grid gap-1">
          {[4, 3, 2].map((r) => {
            const active = filters.rating === r;
            const count = facetCounts.ratings[String(r)] ?? 0;
            return (
              <li key={r}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-brand-tint">
                  <input
                    type="radio"
                    name="rating"
                    checked={active}
                    onChange={() => onChange({ rating: r, page: 1 })}
                    className="accent-brand"
                  />
                  <span className={cn(active && "font-semibold text-brand")}>{r}★ & up</span>
                  <span className="ml-auto text-xs text-muted">{count}</span>
                </label>
              </li>
            );
          })}
          {filters.rating != null && (
            <li>
              <button
                onClick={() => onChange({ rating: undefined, page: 1 })}
                className="px-2 py-1 text-xs text-brand hover:underline"
              >
                Clear rating
              </button>
            </li>
          )}
        </ul>
      </Section>

      <Section title="Availability">
        <ul className="grid gap-1">
          {[
            { key: "made-to-order", label: "Made to order" },
            { key: "in-stock", label: "Ready to ship" },
          ].map((a) => {
            const active = filters.availability === a.key;
            return (
              <li key={a.key}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-brand-tint">
                  <input
                    type="radio"
                    name="availability"
                    checked={active}
                    onChange={() =>
                      onChange({ availability: a.key as ProductFilters["availability"], page: 1 })
                    }
                    className="accent-brand"
                  />
                  <span className={cn(active && "font-semibold text-brand")}>{a.label}</span>
                </label>
              </li>
            );
          })}
          {filters.availability && (
            <li>
              <button
                onClick={() => onChange({ availability: undefined, page: 1 })}
                className="px-2 py-1 text-xs text-brand hover:underline"
              >
                Clear
              </button>
            </li>
          )}
        </ul>
      </Section>
    </div>
  );
}
