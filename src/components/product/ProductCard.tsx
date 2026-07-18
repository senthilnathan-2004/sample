"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ProductDTO } from "@/types";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { IconHeart } from "@/components/ui/icons";
import { RatingPill } from "./RatingPill";
import { useCart, buildCartItem } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { useHasMounted } from "@/lib/useHasMounted";

/**
 * Standard Amazon/Flipkart product card (spec §B2.4) — no 3D flip.
 * Whole card links to the PDP; the wishlist heart and Add-to-cart stopPropagation.
 * Adds the product's first variant to the cart (variant selection happens on the PDP).
 */
export function ProductCard({ product }: { product: ProductDTO }) {
  const href = `/product/${product.slug}`;
  const madeToOrder = product.variants.some((v) => v.stock === null);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const addItem = useCart((s) => s.addItem);
  const toggleWish = useWishlist((s) => s.toggle);
  const wishlistItems = useWishlist((s) => s.items);
  const mounted = useHasMounted();
  const wished = mounted && wishlistItems.some((i) => i.productId === product.id);

  const handleAdd = () => {
    addItem(buildCartItem(product, 0, 1));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  const handleWish = () =>
    toggleWish({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.basePrice,
    });

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card border border-hairline bg-white shadow-card transition-shadow duration-150 hover:shadow-[0_4px_18px_rgba(48,24,18,0.10)]">
      {/* Wishlist heart */}
      <button
        type="button"
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wished}
        onClick={(e) => {
          e.preventDefault();
          handleWish();
        }}
        className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-muted shadow-card hover:text-brand"
      >
        <IconHeart className={cn("h-5 w-5", wished && "fill-brand text-brand")} />
      </button>

      {/* Discount badge */}
      {product.discountPct > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded bg-brand-tint px-1.5 py-0.5 text-xs font-semibold text-brand">
          −{product.discountPct}%
        </span>
      )}

      <Link href={href} className="flex flex-1 flex-col">
        {/* Locked aspect ratio image (zero CLS) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
          {product.images[0] && !imgError ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-3xl">🧶</div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-2 sm:p-3">
          <h3 className="line-clamp-1 font-heading text-sm font-bold leading-snug text-ink">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5">
            <RatingPill rating={product.ratingAvg} />
            {product.ratingCount > 0 && (
              <span className="text-xs text-muted">({product.ratingCount})</span>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-base font-semibold text-ink">{formatINR(product.basePrice)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
              <span className="text-xs text-muted line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
            {product.discountPct > 0 && (
              <span className="text-xs font-medium text-brand">−{product.discountPct}%</span>
            )}
          </div>

          <span className="mt-0.5 inline-flex w-fit rounded bg-cream px-1.5 py-0.5 text-[11px] font-medium text-muted">
            {madeToOrder ? `Made to order · ${product.leadTimeDays}d` : "In stock"}
          </span>
        </div>
      </Link>

      {/* Add to cart: always visible */}
      <div className="p-2 pt-0 sm:p-3 sm:pt-0">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="h-10 w-full rounded-control bg-brand text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
