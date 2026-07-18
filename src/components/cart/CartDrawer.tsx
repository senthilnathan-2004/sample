"use client";

import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { CartItem } from "./CartItem";
import { useCart, selectSubtotal } from "@/store/cartStore";
import { formatINR } from "@/lib/format";
import { shippingFor } from "@/lib/commerce";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const shipping = shippingFor(subtotal);

  return (
    <Drawer open={open} onClose={onClose} title={`Your cart (${items.length})`}>
      {items.length === 0 ? (
        <div className="grid place-items-center gap-3 p-8 text-center">
          <p className="text-muted">Your cart is empty.</p>
          <Link
            href="/shop"
            onClick={onClose}
            className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto px-4">
            {items.map((item) => (
              <CartItem key={item.key} item={item} compact />
            ))}
          </div>
          <div className="border-t border-hairline p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">{formatINR(subtotal)}</span>
            </div>
            <div className="mb-3 flex justify-between text-xs text-muted">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button variant="primary" className="w-full">
                Checkout · {formatINR(subtotal + shipping)}
              </Button>
            </Link>
            <Link href="/cart" onClick={onClose}>
              <Button variant="secondary" className="mt-2 w-full">
                View cart
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
}
