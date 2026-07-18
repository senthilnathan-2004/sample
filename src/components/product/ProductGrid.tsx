import type { ProductDTO } from "@/types";
import { ProductCard } from "./ProductCard";

// Responsive grid: 2-col on small phones → up to 4-col desktop.
export function ProductGrid({ products }: { products: ProductDTO[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
