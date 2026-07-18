"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem as CartItemT } from "@/types";
import { formatINR } from "@/lib/format";
import { useCart } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";

export function CartItem({ item, compact = false }: { item: CartItemT; compact?: boolean }) {
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);
  const toggleWish = useWishlist((s) => s.toggle);

  const moveToWishlist = () => {
    toggleWish({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      image: item.image,
      price: item.unitPrice,
    });
    removeItem(item.key);
  };

  return (
    <div className="flex items-start gap-3 border-b border-hairline py-3">
      <Link
        href={`/product/${item.slug}`}
        className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-md bg-cream sm:w-24"
      >
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-2xl">🧶</div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-medium hover:text-brand">
          {item.name}
        </Link>
        <p className="text-xs text-muted">
          {item.variant.color}
          {item.variant.size ? ` · ${item.variant.size}` : ""}
          {item.customText ? ` · “${item.customText}”` : ""}
        </p>
        <p className="mt-0.5 text-xs text-muted">Made to order · ships in {item.leadTimeDays} days</p>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center rounded-control border border-hairline">
            <button
              onClick={() => setQty(item.key, item.quantity - 1)}
              className="grid h-8 w-8 place-items-center text-lg"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-7 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => setQty(item.key, item.quantity + 1)}
              className="grid h-8 w-8 place-items-center text-lg"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button onClick={() => removeItem(item.key)} className="text-xs text-muted hover:text-brand">
            Remove
          </button>
          {!compact && (
            <button onClick={moveToWishlist} className="text-xs text-muted hover:text-brand">
              Move to wishlist
            </button>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right text-sm font-semibold">
        {formatINR(item.unitPrice * item.quantity)}
      </div>
    </div>
  );
}
