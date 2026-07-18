"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { CategoryDTO, ProductDTO, ProductQueryResult, SortKey } from "@/types";
import type { ProductFilters } from "@/lib/catalog";
import { filtersToSearchParams } from "@/lib/productQuery";
import { FilterRail } from "./FilterRail";
import { SortBar } from "./SortBar";
import { ProductGrid } from "./ProductGrid";
import { ProductListRow } from "./ProductListRow";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

export function ShopClient({
  initial,
  categories,
  initialFilters,
  lockedCategory,
}: {
  initial: ProductQueryResult;
  categories: CategoryDTO[];
  initialFilters: ProductFilters;
  lockedCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<ProductDTO[]>(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [facetCounts, setFacetCounts] = useState(initial.facetCounts);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const catName = useCallback(
    (slug?: string) => categories.find((c) => c.slug === slug)?.name ?? slug,
    [categories],
  );

  const fetchPage = useCallback(
    async (f: ProductFilters): Promise<ProductQueryResult | null> => {
      const sp = filtersToSearchParams(f);
      const res = await fetch(`/api/products?${sp.toString()}`);
      if (!res.ok) return null;
      return (await res.json()) as ProductQueryResult;
    },
    [],
  );

  // Apply a filter/sort change: reset to page 1, replace list, sync URL.
  const applyPatch = useCallback(
    async (patch: Partial<ProductFilters>) => {
      const next: ProductFilters = { ...filters, ...patch, page: 1 };
      setFilters(next);
      setLoading(true);
      const sp = filtersToSearchParams({ ...next, category: lockedCategory ? undefined : next.category });
      router.replace(`${pathname}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
      const result = await fetchPage(next);
      if (result) {
        setProducts(result.items);
        setTotal(result.total);
        setFacetCounts(result.facetCounts);
      }
      setLoading(false);
    },
    [filters, fetchPage, router, pathname, lockedCategory],
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || products.length >= total) return;
    setLoadingMore(true);
    const nextPage = (filters.page ?? 1) + 1;
    const result = await fetchPage({ ...filters, page: nextPage });
    if (result) {
      setProducts((prev) => [...prev, ...result.items]);
      setFilters((f) => ({ ...f, page: nextPage }));
    }
    setLoadingMore(false);
  }, [loadingMore, loading, products.length, total, filters, fetchPage]);

  // Infinite-scroll sentinel.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && loadMore(),
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  // Active-filter chips.
  const chips: { label: string; clear: () => void }[] = [];
  if (!lockedCategory && filters.category)
    chips.push({ label: `${catName(filters.category)}`, clear: () => applyPatch({ category: undefined }) });
  if (filters.minPrice != null || filters.maxPrice != null)
    chips.push({
      label: `₹${filters.minPrice ?? 0}${filters.maxPrice != null ? `–₹${filters.maxPrice}` : "+"}`,
      clear: () => applyPatch({ minPrice: undefined, maxPrice: undefined }),
    });
  for (const color of filters.colors ?? [])
    chips.push({
      label: color,
      clear: () => applyPatch({ colors: (filters.colors ?? []).filter((c) => c !== color) }),
    });
  if (filters.rating != null)
    chips.push({ label: `${filters.rating}★ & up`, clear: () => applyPatch({ rating: undefined }) });
  if (filters.availability)
    chips.push({
      label: filters.availability === "made-to-order" ? "Made to order" : "Ready to ship",
      clear: () => applyPatch({ availability: undefined }),
    });

  const clearAll = () =>
    applyPatch({
      category: lockedCategory ? filters.category : undefined,
      minPrice: undefined,
      maxPrice: undefined,
      colors: undefined,
      rating: undefined,
      availability: undefined,
    });

  const rail = (
    <FilterRail
      facetCounts={facetCounts}
      categories={categories}
      filters={filters}
      lockedCategory={lockedCategory}
      onChange={(patch) => {
        applyPatch(patch);
        setSheetOpen(false);
      }}
    />
  );

  return (
    <div className="mx-auto max-w-page px-4 py-6">
      <div className="flex gap-6">
        {/* Desktop filter rail */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <p className="mb-1 font-heading text-lg font-bold">Filters</p>
            {rail}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <SortBar
            sort={(filters.sort ?? "popularity") as SortKey}
            view={view}
            total={total}
            onSort={(s) => applyPatch({ sort: s })}
            onView={setView}
          />

          {/* Mobile: filter button + active chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSheetOpen(true)}
              className="rounded-full border border-hairline px-3 py-1.5 text-sm font-medium lg:hidden"
            >
              ⚙ Filters
            </button>
            {chips.map((c, i) => (
              <Chip key={`${c.label}-${i}`} selected onRemove={c.clear}>
                {c.label}
              </Chip>
            ))}
            {chips.length > 0 && (
              <button onClick={clearAll} className="text-sm text-brand hover:underline">
                Clear all
              </button>
            )}
          </div>

          {/* Results */}
          <div className="mt-4">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="grid place-items-center gap-3 py-16 text-center">
                <p className="text-lg font-semibold">No products match these filters.</p>
                <Button variant="secondary" onClick={clearAll}>
                  Clear all filters
                </Button>
              </div>
            ) : view === "list" ? (
              <div className="grid gap-3">
                {products.map((p) => (
                  <ProductListRow key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <ProductGrid products={products} />
            )}

            {/* Infinite-scroll sentinel + loading-more skeletons */}
            {products.length < total && (
              <div ref={sentinelRef} className="mt-6">
                {loadingMore && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[3/4] w-full" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters">
        {rail}
      </BottomSheet>
    </div>
  );
}
