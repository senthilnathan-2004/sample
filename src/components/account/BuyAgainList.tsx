"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { BuyAgainItem } from "@/lib/account";
import { formatINR } from "@/lib/format";
import { useCart } from "@/store/cartStore";

export function BuyAgainList({ items }: { items: BuyAgainItem[] }) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState<string | null>(null);

  const add = (item: BuyAgainItem) => {
    addItem({
      key: `${item.productId}:|`,
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      image: item.image,
      variant: { color: "" },
      unitPrice: item.price,
      quantity: 1,
      leadTimeDays: 4,
    });
    setAdded(item.productId);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
            <button
              onClick={() => add(item)}
              className="mt-auto h-9 rounded-control bg-brand text-sm font-medium text-white hover:bg-brand-hover"
            >
              {added === item.productId ? "Added ✓" : "Buy again"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
