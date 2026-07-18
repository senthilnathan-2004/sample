import Link from "next/link";
import { IconArrowRight, IconHeart, IconTruck, IconGift } from "@/components/ui/icons";

/**
 * Zepto-style two-up promo row. Left card carries the brand value props
 * (handmade / free shipping / personalise); right card is a themed CTA promo.
 * Flat brand tints only — no gradients (per the brand system).
 */
const PROPS = [
  { Icon: IconHeart, label: "Made by hand" },
  { Icon: IconTruck, label: "Free shipping ₹999+" },
  { Icon: IconGift, label: "Personalise it" },
];

export function PromoCards() {
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-2">
      {/* Left: value props */}
      <div className="rounded-card bg-brand-tint p-5 sm:p-7">
        <p className="font-heading text-lg font-extrabold uppercase tracking-wide text-brand sm:text-2xl">
          The all-handmade experience
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {PROPS.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-control bg-white p-3 text-center shadow-card"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-tint text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-ink sm:text-xs">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">*Free shipping applies above the minimum order value.</p>
      </div>

      {/* Right: themed CTA promo */}
      <div className="relative overflow-hidden rounded-card bg-brand-tint-strong p-5 sm:p-7">
        <p className="font-heading text-2xl font-extrabold text-brand sm:text-4xl">Gift Corner</p>
        <p className="mt-2 max-w-sm text-sm text-ink sm:text-base">
          Custom bouquets, name keychains &amp; hampers — crocheted to order and delivered across India.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Order now
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
