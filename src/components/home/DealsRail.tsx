import Link from "next/link";
import type { ProductDTO } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

// Horizontal-scroll rail of product cards (bestsellers / deals / related).
export function DealsRail({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: ProductDTO[];
  viewAllHref?: string;
}) {
  if (!products.length) return null;
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm text-brand hover:underline">
            View all →
          </Link>
        )}
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
        {products.slice(0, 5).map((p) => (
          <div key={p.id} className="w-[65vw] shrink-0 snap-start sm:w-[40vw] lg:w-[18vw]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
