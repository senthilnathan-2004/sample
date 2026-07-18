import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { queryProducts, getCategories } from "@/lib/catalog";
import { parseProductFilters } from "@/lib/productQuery";
import { toURLSearchParams } from "@/lib/searchParams";
import { ShopClient } from "@/components/product/ShopClient";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === params.category);
  if (!cat) return { title: "Category" };
  return {
    title: cat.name,
    description: cat.description ?? `Handmade crochet ${cat.name.toLowerCase()}.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === params.category);
  if (!cat) notFound();

  const filters = parseProductFilters(toURLSearchParams(searchParams), params.category);
  const initial = await queryProducts(filters);

  return (
    <>
      <div className="mx-auto max-w-page px-4 pt-4">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: cat.name }]}
        />
        <h1 className="mt-2 font-heading text-2xl font-extrabold">{cat.name}</h1>
        {cat.description && <p className="mt-1 text-sm text-muted">{cat.description}</p>}
      </div>
      <ShopClient
        initial={initial}
        categories={categories}
        initialFilters={filters}
        lockedCategory={params.category}
      />
    </>
  );
}
