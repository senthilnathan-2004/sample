"use client";

import Link from "next/link";
import { useCart, selectSubtotal } from "@/store/cartStore";
import { shippingFor } from "@/lib/commerce";
import { useHasMounted } from "@/lib/useHasMounted";
import { CartItem } from "@/components/cart/CartItem";
import { PriceDetails } from "@/components/cart/PriceDetails";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CartPage() {
  const mounted = useHasMounted();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const shipping = shippingFor(subtotal);

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
      <h1 className="font-heading text-2xl font-extrabold">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-8 grid place-items-center gap-4 rounded-card border border-hairline py-16 text-center">
          <p className="text-lg">Your cart is empty.</p>
          <Link href="/shop">
            <Button variant="primary">Start shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <div>
            {items.map((item) => (
              <CartItem key={item.key} item={item} />
            ))}
          </div>
          <div className="h-fit lg:sticky lg:top-24">
            <PriceDetails subtotal={subtotal} shipping={shipping} />
            <Link href="/checkout" className="mt-3 block">
              <Button variant="primary" className="w-full">
                Proceed to checkout
              </Button>
            </Link>
            <p className="mt-2 text-center text-xs text-muted">
              Apply coupon codes at checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
