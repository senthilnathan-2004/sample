"use client";

import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import { useHasMounted } from "@/lib/useHasMounted";

// Reads the client-side recently-viewed store (localStorage).
export function RecentlyViewedRail() {
  const mounted = useHasMounted();
  const items = useRecentlyViewed((s) => s.items);
  if (!mounted || items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 font-heading text-xl font-bold">Recently viewed</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {items.map((it) => (
          <Link
            key={it.slug}
            href={`/product/${it.slug}`}
            className="w-[45vw] shrink-0 rounded-card border border-hairline bg-white p-2 shadow-card sm:w-[25vw] lg:w-[12vw]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-cream">
              {it.image ? (
                <Image src={it.image} alt={it.name} fill sizes="128px" className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-2xl">🧶</div>
              )}
            </div>
            <p className="mt-1 line-clamp-1 text-xs">{it.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
