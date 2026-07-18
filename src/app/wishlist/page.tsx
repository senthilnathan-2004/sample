"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/store/wishlistStore";
import { useCart, buildCartItem } from "@/store/cartStore";
import { useHasMounted } from "@/lib/useHasMounted";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/format";

export default function WishlistPage() {
  const mounted = useHasMounted();
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const addItem = useCart((s) => s.addItem);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-page px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <h1 className="font-heading text-2xl font-extrabold">Your wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-8 grid place-items-center gap-4 rounded-card border border-hairline py-16 text-center">
          <p className="text-lg">Your wishlist is empty.</p>
          <Link href="/shop">
            <Button variant="primary">Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col overflow-hidden rounded-card border border-hairline bg-white shadow-card"
            >
              <Link href={`/product/${item.slug}`} className="relative aspect-square bg-cream">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="25vw" className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-3xl">🧶</div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Link href={`/product/${item.slug}`} className="line-clamp-2 text-sm font-medium">
                  {item.name}
                </Link>
                <span className="text-sm font-semibold">{formatINR(item.price)}</span>
                <div className="mt-auto grid gap-1.5">
                  <button
                    onClick={() => {
                      addItem({
                        key: `${item.productId}:wishlist`,
                        productId: item.productId,
                        slug: item.slug,
                        name: item.name,
                        image: item.image,
                        variant: { color: "" },
                        unitPrice: item.price,
                        quantity: 1,
                        leadTimeDays: 4,
                      });
                      remove(item.productId);
                    }}
                    className="h-9 rounded-control bg-brand text-sm font-medium text-white hover:bg-brand-hover"
                  >
                    Move to cart
                  </button>
                  <button
                    onClick={() => remove(item.productId)}
                    className="text-xs text-muted hover:text-brand"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
