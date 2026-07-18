import type { ProductFilters } from "./catalog";
import type { SortKey } from "@/types";

const SORTS: SortKey[] = ["popularity", "price-asc", "price-desc", "newest", "rating", "discount"];

function num(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Parses URL search params into ProductFilters. Used by both the /api/products
 * route and the shop/search server components so query semantics stay in one place.
 * `categoryOverride` lets /shop/[category] pin the category from the path.
 */
export function parseProductFilters(
  sp: URLSearchParams,
  categoryOverride?: string,
): ProductFilters {
  const sortRaw = sp.get("sort") as SortKey | null;
  const availabilityRaw = sp.get("availability");
  return {
    category: categoryOverride ?? sp.get("category") ?? undefined,
    q: sp.get("q") ?? undefined,
    minPrice: num(sp.get("minPrice")),
    maxPrice: num(sp.get("maxPrice")),
    colors: sp.get("colors") ? sp.get("colors")!.split(",").filter(Boolean) : undefined,
    rating: num(sp.get("rating")),
    availability:
      availabilityRaw === "made-to-order" || availabilityRaw === "in-stock"
        ? availabilityRaw
        : undefined,
    sort: sortRaw && SORTS.includes(sortRaw) ? sortRaw : "popularity",
    page: num(sp.get("page")) ?? 1,
  };
}

/** Build a query string from filters (used by client-side navigation). */
export function filtersToSearchParams(f: Partial<ProductFilters>): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.category) sp.set("category", f.category);
  if (f.minPrice != null) sp.set("minPrice", String(f.minPrice));
  if (f.maxPrice != null) sp.set("maxPrice", String(f.maxPrice));
  if (f.colors?.length) sp.set("colors", f.colors.join(","));
  if (f.rating != null) sp.set("rating", String(f.rating));
  if (f.availability) sp.set("availability", f.availability);
  if (f.sort && f.sort !== "popularity") sp.set("sort", f.sort);
  if (f.page && f.page > 1) sp.set("page", String(f.page));
  return sp;
}
