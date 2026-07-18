"use client";

import { useState } from "react";
import { IconCart } from "@/components/ui/icons";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart, selectCount } from "@/store/cartStore";
import { useHasMounted } from "@/lib/useHasMounted";

// Cart button (Zepto-style: icon + label with count badge), opens the CartDrawer.
export function CartButton() {
  const [open, setOpen] = useState(false);
  const mounted = useHasMounted();
  const count = useCart(selectCount);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Cart, ${mounted ? count : 0} items`}
        className="relative flex h-11 items-center gap-1.5 rounded-full px-2 text-ink hover:bg-brand-tint sm:px-3"
      >
        <span className="relative">
          <IconCart className="h-6 w-6" />
          {mounted && count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </span>
        <span className="hidden text-sm font-medium sm:block">Cart</span>
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
