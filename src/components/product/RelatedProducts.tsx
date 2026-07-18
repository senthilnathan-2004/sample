import type { ProductDTO } from "@/types";
import { ProductCard } from "./ProductCard";

// "Customers also viewed" rail — horizontal scroll on mobile, grid on desktop.
export function RelatedProducts({ products }: { products: ProductDTO[] }) {
  if (!products.length) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 font-heading text-xl font-bold">Customers also viewed</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
        {products.map((p) => (
          <div key={p.id} className="w-[65vw] shrink-0 snap-start sm:w-auto">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
