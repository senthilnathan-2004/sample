import Link from "next/link";
import Image from "next/image";
import type { ProductDTO } from "@/types";
import { formatINR } from "@/lib/format";
import { RatingPill } from "./RatingPill";

// Amazon horizontal row — used by the shop list-view toggle.
export function ProductListRow({ product }: { product: ProductDTO }) {
  const href = `/product/${product.slug}`;
  const madeToOrder = product.variants.some((v) => v.stock === null);

  return (
    <Link
      href={href}
      className="flex gap-4 rounded-card border border-hairline bg-white p-3 shadow-card transition-shadow hover:shadow-[0_4px_18px_rgba(48,24,18,0.10)]"
    >
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-md bg-cream sm:w-36">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="144px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-3xl">🧶</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <h3 className="font-heading text-base font-bold leading-snug text-ink">{product.name}</h3>
        <div className="flex items-center gap-1.5">
          <RatingPill rating={product.ratingAvg} />
          {product.ratingCount > 0 && (
            <span className="text-xs text-muted">({product.ratingCount})</span>
          )}
        </div>
        <p className="line-clamp-2 text-sm text-muted">{product.description}</p>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-semibold text-ink">{formatINR(product.basePrice)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="text-sm text-muted line-through">
              {formatINR(product.compareAtPrice)}
            </span>
          )}
          {product.discountPct > 0 && (
            <span className="text-sm font-medium text-brand">−{product.discountPct}%</span>
          )}
        </div>
        <span className="text-xs text-muted">
          {madeToOrder ? `Made to order · ships in ${product.leadTimeDays} days` : "In stock"}
        </span>
      </div>
    </Link>
  );
}
