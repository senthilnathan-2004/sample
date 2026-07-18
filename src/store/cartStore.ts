"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, ProductDTO } from "@/types";

/**
 * Cart state, persisted to localStorage. For logged-in users this is synced to
 * the server in Phase 4; prices here are for display only — the order total is
 * always recomputed server-side at checkout (never trusted from the client).
 */
type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.key === item.key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === item.key ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "lp-cart" },
  ),
);

// Derived selectors (call with useCart(selector)).
export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

/** Build a cart line from a product + selected variant. */
export function buildCartItem(
  product: ProductDTO,
  variantIndex: number,
  quantity: number,
  customText?: string,
): CartItem {
  const v = product.variants[variantIndex];
  const variant = { color: v?.color ?? "", size: v?.size };
  const sig = `${variant.color}|${variant.size ?? ""}|${customText ?? ""}`;
  return {
    key: `${product.id}:${sig}`,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0],
    variant,
    unitPrice: product.basePrice + (v?.priceDelta ?? 0),
    quantity,
    leadTimeDays: product.leadTimeDays,
    customText: customText || undefined,
  };
}
