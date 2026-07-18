"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { BuyAgainItem } from "@/lib/account";
import { formatINR } from "@/lib/format";

// Logged-in "Buy again" rail — fetches from the account API; hidden when empty.
export function BuyAgainRail() {
  const { status } = useSession();
  const [items, setItems] = useState<BuyAgainItem[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account/buy-again")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, [status]);

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Buy again</h2>
        <Link href="/account/buy-again" className="text-sm text-brand hover:underline">
          View all →
        </Link>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {items.map((it) => (
          <Link
            key={it.productId}
            href={`/product/${it.slug}`}
            className="w-[50vw] shrink-0 rounded-card border border-hairline bg-white p-2 shadow-card sm:w-[30vw] lg:w-[15vw]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-cream">
              {it.image ? (
                <Image src={it.image} alt={it.name} fill sizes="144px" className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-2xl">🧶</div>
              )}
            </div>
            <p className="mt-1 line-clamp-1 text-xs">{it.name}</p>
            <p className="text-sm font-semibold">{formatINR(it.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
