import type { Metadata } from "next";
import { queryProducts, getCategories } from "@/lib/catalog";
import { parseProductFilters } from "@/lib/productQuery";
import { toURLSearchParams } from "@/lib/searchParams";
import { ShopClient } from "@/components/product/ShopClient";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "Shop all handmade crochet",
  description: "Browse handmade crochet keychains, bouquets, bag charms, soft toys and accessories.",
};

// Dynamic because results depend on query filters.
export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseProductFilters(toURLSearchParams(searchParams));
  const [initial, categories] = await Promise.all([queryProducts(filters), getCategories()]);

  return (
    <>
      <div className="mx-auto max-w-page px-4 pt-4">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
        <h1 className="mt-2 font-heading text-2xl font-extrabold">All products</h1>
      </div>
      <ShopClient initial={initial} categories={categories} initialFilters={filters} />
    </>
  );
}
