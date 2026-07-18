import type { Metadata } from "next";
import { queryProducts, getCategories } from "@/lib/catalog";
import { parseProductFilters } from "@/lib/productQuery";
import { toURLSearchParams } from "@/lib/searchParams";
import { ShopClient } from "@/components/product/ShopClient";
import { SearchDiscovery } from "@/components/product/SearchDiscovery";
import { SearchBar } from "@/components/layout/SearchBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false } };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseProductFilters(toURLSearchParams(searchParams));
  const q = (filters.q ?? "").trim();

  const [initial, categories] = await Promise.all([queryProducts(filters), getCategories()]);

  // No query → Zepto-style discovery landing (trending / popular / categories).
  if (!q) {
    return (
      <>
        <div className="mx-auto max-w-page px-4 pt-6 pb-2 lg:hidden">
          <SearchBar categories={categories} />
        </div>
        <SearchDiscovery categories={categories} popularProducts={initial.items} />
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-page px-4 pt-6 pb-2 lg:hidden">
        <SearchBar categories={categories} />
      </div>
      <div className="mx-auto max-w-page px-4 pt-4 lg:px-6">
        <h1 className="font-heading text-2xl font-extrabold">
          Results for <span className="text-brand">“{q}”</span>
        </h1>
        <p className="mt-1 text-sm text-muted">{initial.total} products</p>
      </div>
      <ShopClient initial={initial} categories={categories} initialFilters={filters} />
    </>
  );
}
