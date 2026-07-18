import Link from "next/link";
import type { CategoryDTO, ProductDTO } from "@/types";
import { IconTrending, IconSearch } from "@/components/ui/icons";

/**
 * Zepto-style search landing shown when there's no active query: trending &
 * popular searches (chips) plus a full category grid. Content is data-driven
 * from live categories and popular products, with curated fallbacks.
 */
const TRENDING = ["Flower bouquets", "Name keychains", "Gift hampers", "Baby booties", "Bag charms", "Amigurumi"];
const POPULAR = ["Rose bouquet", "Sunflower", "Tulip", "Heart keychain", "Coasters", "Scrunchies", "Beanie", "Tote bag"];

function ChipRow({ label, items }: { label: string; items: { name: string; href: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
      <span className="w-24 shrink-0 pt-1.5 text-sm font-semibold text-ink">{label}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <Link
            key={it.name}
            href={it.href}
            className="rounded-full border border-hairline bg-white px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-brand hover:bg-brand-tint hover:text-brand"
          >
            {it.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SearchDiscovery({
  categories,
  popularProducts,
}: {
  categories: CategoryDTO[];
  popularProducts: ProductDTO[];
}) {
  const q = (term: string) => `/search?q=${encodeURIComponent(term)}`;

  const trendingCats = categories.slice(0, 8).map((c) => ({ name: c.name, href: `/shop/${c.slug}` }));
  const trendingProducts = (popularProducts.length
    ? popularProducts.slice(0, 8).map((p) => p.name)
    : TRENDING
  ).map((n) => ({ name: n, href: q(n) }));
  const popular = POPULAR.map((n) => ({ name: n, href: q(n) }));

  return (
    <div className="mx-auto max-w-page px-4 py-6 lg:px-6">
      {/* Trending */}
      <section>
        <h2 className="flex items-center gap-2 font-heading text-lg font-extrabold text-ink">
          <IconTrending className="h-5 w-5 text-brand" />
          Trending Searches
        </h2>
        <div className="mt-4 grid gap-4">
          <ChipRow label="Categories" items={trendingCats} />
          <ChipRow label="Products" items={trendingProducts} />
        </div>
      </section>

      {/* Popular */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-heading text-lg font-extrabold text-ink">
          <IconSearch className="h-5 w-5 text-brand" />
          Popular Searches
        </h2>
        <div className="mt-4 grid gap-4">
          <ChipRow label="Products" items={popular} />
        </div>
      </section>

      {/* Categories grid */}
      <section className="mt-10">
        <h2 className="font-heading text-lg font-extrabold text-ink">Categories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              className="rounded-card border border-hairline bg-white px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-brand hover:bg-brand-tint hover:text-brand"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
