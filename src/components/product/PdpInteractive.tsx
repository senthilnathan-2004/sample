"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductDTO } from "@/types";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import {
  IconHeart,
  IconChevronRight,
  IconTruck,
  IconRefresh,
  IconShield,
  IconLock,
  IconZap,
  IconCart,
  IconPlus,
  IconMinus,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { RatingPill } from "./RatingPill";
import { VariantPicker } from "./VariantPicker";
import { DeliveryEstimate } from "./DeliveryEstimate";
import { useCart, buildCartItem } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import { useHasMounted } from "@/lib/useHasMounted";

/**
 * PDP info + buy box (Zepto layout): brand → title → qty/rating → price box →
 * badge tiles → variant/personalise → highlights, with a sticky right buy box on
 * desktop and a sticky bottom CTA on mobile.
 */
export function PdpInteractive({ product }: { product: ProductDTO }) {
  const router = useRouter();
  const [variantIndex, setVariantIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [customText, setCustomText] = useState("");
  const [added, setAdded] = useState(false);

  const addItem = useCart((s) => s.addItem);
  const toggleWish = useWishlist((s) => s.toggle);
  const wishlistItems = useWishlist((s) => s.items);
  const logRecent = useRecentlyViewed((s) => s.add);
  const mounted = useHasMounted();
  const wished = mounted && wishlistItems.some((i) => i.productId === product.id);

  useEffect(() => {
    logRecent({ slug: product.slug, name: product.name, image: product.images[0] });
  }, [product.slug, product.name, product.images, logRecent]);

  const variant = product.variants[variantIndex];
  const madeToOrder = product.variants.some((v) => v.stock === null);
  const unitPrice = product.basePrice + (variant?.priceDelta ?? 0);
  const compareAt =
    product.compareAtPrice && product.compareAtPrice > product.basePrice
      ? product.compareAtPrice + (variant?.priceDelta ?? 0)
      : undefined;
  const savings = compareAt ? compareAt - unitPrice : 0;

  const handleAdd = () => {
    addItem(buildCartItem(product, variantIndex, qty, customText));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };
  const handleBuyNow = () => {
    addItem(buildCartItem(product, variantIndex, qty, customText));
    router.push("/checkout");
  };
  const handleWish = () =>
    toggleWish({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.basePrice,
    });

  // Zepto-style price box.
  const PriceBox = (
    <div className="rounded-card border border-hairline bg-cream p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="rounded-control bg-brand px-3 py-1.5 text-2xl font-extrabold text-white">
          {formatINR(unitPrice)}
        </span>
        {compareAt && (
          <span className="text-sm text-muted">
            MRP <span className="line-through">{formatINR(compareAt)}</span>{" "}
            <span className="text-[11px]">(incl. of all taxes)</span>
          </span>
        )}
        {savings > 0 && (
          <span className="text-sm font-bold text-brand">{formatINR(savings)} OFF</span>
        )}
      </div>
      {!compareAt && <p className="mt-1.5 text-xs text-muted">Inclusive of all taxes</p>}
    </div>
  );

  // Zepto-style trust/service tiles.
  const badges: { Icon: typeof IconTruck; label: string; sub: string }[] = [
    madeToOrder
      ? { Icon: IconRefresh, label: "Made to Order", sub: `Ready in ${product.leadTimeDays} days` }
      : { Icon: IconShield, label: "In Stock", sub: "Ships promptly" },
    { Icon: IconTruck, label: "Ships Pan-India", sub: "Tracked delivery" },
  ];

  // Highlights table rows.
  const highlights: { k: string; v: string }[] = [
    { k: "Brand", v: "Lara's Pinnal" },
    ...(product.category.name ? [{ k: "Category", v: product.category.name }] : []),
    { k: "Made to Order", v: madeToOrder ? "Yes" : "No" },
    { k: "Lead Time", v: `${product.leadTimeDays} days` },
    { k: "Personalisation", v: product.isCustomizable ? "Available" : "Not available" },
    ...(product.tags.length ? [{ k: "Key Features", v: product.tags.slice(0, 4).join(", ") }] : []),
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Info column */}
      <div className="min-w-0">
        <Link
          href={`/shop/${product.category.slug}`}
          className="inline-flex items-center gap-0.5 text-sm font-medium text-brand hover:underline"
        >
          Lara&apos;s Pinnal
          <IconChevronRight className="h-4 w-4" />
        </Link>

        <h1 className="mt-1 font-heading text-xl font-extrabold leading-tight text-ink sm:text-2xl">
          {product.name}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {variant?.size && <span className="text-sm text-muted">Size: {variant.size}</span>}
          <span className="flex items-center gap-1.5">
            <RatingPill rating={product.ratingAvg} />
            {product.ratingCount > 0 && (
              <a href="#reviews" className="text-sm text-muted hover:text-brand">
                ({product.ratingCount})
              </a>
            )}
          </span>
        </div>

        <div className="mt-4">{PriceBox}</div>

        {/* Service badge tiles */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-card bg-cream p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
                <b.Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-ink">{b.label}</span>
                <span className="block truncate text-[11px] text-muted">{b.sub}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <VariantPicker
            variants={product.variants}
            selectedIndex={variantIndex}
            onSelect={setVariantIndex}
          />
        </div>

        {variant?.customTextAllowed && (
          <div className="mt-4">
            <label htmlFor="customText" className="mb-1.5 block text-sm font-medium text-ink">
              Personalise (optional)
            </label>
            <input
              id="customText"
              value={customText}
              onChange={(e) => setCustomText(e.target.value.slice(0, 24))}
              placeholder="Name or short text (max 24 chars)"
              className="h-11 w-full max-w-sm rounded-control border border-hairline px-3 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        )}

        <div className="mt-5 max-w-sm">
          <DeliveryEstimate leadTimeDays={product.leadTimeDays} />
        </div>

        {/* Highlights table */}
        <section className="mt-8 rounded-card border border-hairline">
          <h2 className="border-b border-hairline px-4 py-3 font-heading text-base font-extrabold text-ink">
            Highlights
          </h2>
          <dl className="divide-y divide-hairline">
            {highlights.map((row) => (
              <div key={row.k} className="grid grid-cols-[10rem_1fr] gap-4 px-4 py-3 text-sm">
                <dt className="text-muted">{row.k}</dt>
                <dd className="font-medium text-ink">{row.v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Right buy box (desktop/tablet) */}
      <aside className="hidden h-fit self-start rounded-card border border-hairline bg-white p-5 shadow-card md:block lg:sticky lg:top-32">
        <div className="mb-5">{PriceBox}</div>

        <div className="mb-5 flex items-center justify-between gap-4">
          <label htmlFor="qty" className="text-sm font-medium text-ink">
            Quantity
          </label>
          <div className="inline-flex items-center rounded-control border border-hairline">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid h-10 w-10 place-items-center text-muted hover:text-brand"
              aria-label="Decrease quantity"
            >
              <IconMinus className="h-4 w-4" />
            </button>
            <span id="qty" className="w-8 text-center font-semibold text-ink">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="grid h-10 w-10 place-items-center text-muted hover:text-brand"
              aria-label="Increase quantity"
            >
              <IconPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          <Button variant="primary" onClick={handleAdd} className="h-12 w-full gap-2">
            <IconCart className="h-5 w-5" />
            {added ? "Added ✓" : "Add to Cart"}
          </Button>
          <Button variant="secondary" onClick={handleBuyNow} className="h-12 w-full gap-2">
            <IconZap className="h-5 w-5" />
            Buy Now
          </Button>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleWish}
            aria-pressed={wished}
            className="group flex items-center justify-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand"
          >
            <IconHeart className={cn("h-5 w-5 transition-transform group-hover:scale-110", wished ? "fill-brand text-brand" : "")} />
            {wished ? "Saved to Wishlist" : "Save to Wishlist"}
          </button>
        </div>

        <hr className="my-5 border-hairline" />

        <div className="grid gap-2 text-xs font-medium text-muted">
          <div className="flex items-center gap-2">
            <IconLock className="h-4 w-4 shrink-0 text-brand" />
            <span>Secure, encrypted payment</span>
          </div>
          <div className="flex items-center gap-2">
            <IconShield className="h-4 w-4 shrink-0 text-brand" />
            <span>Premium handmade quality</span>
          </div>
        </div>
      </aside>

      {/* Sticky mobile bottom CTA (sits above the mobile tab bar) */}
      <div className="fixed inset-x-0 bottom-14 z-30 flex gap-2 border-t border-hairline bg-white p-3 md:hidden">
        <Button variant="secondary" className="flex-1" onClick={handleAdd}>
          {added ? "Added ✓" : "Add to Cart"}
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleBuyNow}>
          Buy Now
        </Button>
      </div>
    </div>
  );
}
