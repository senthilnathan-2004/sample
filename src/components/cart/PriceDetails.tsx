import { formatINR } from "@/lib/format";
import { SHIPPING } from "@/lib/commerce";

// Amazon "Order summary" / Flipkart "Price details" panel.
export function PriceDetails({
  subtotal,
  discount = 0,
  shipping,
  couponCode,
}: {
  subtotal: number;
  discount?: number;
  shipping: number;
  couponCode?: string;
}) {
  const total = Math.max(0, subtotal - discount) + shipping;
  const away = SHIPPING.freeThreshold - subtotal;

  return (
    <div className="rounded-card border border-hairline bg-white p-4 text-sm shadow-card">
      <p className="mb-3 font-heading text-base font-bold">Price details</p>
      <dl className="grid gap-2">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatINR(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Discount{couponCode ? ` (${couponCode})` : ""}</dt>
            <dd>−{formatINR(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
        </div>
        {away > 0 && subtotal > 0 && (
          <p className="text-xs text-muted">Add {formatINR(away)} more for free shipping.</p>
        )}
      </dl>
      <div className="mt-3 flex justify-between border-t border-hairline pt-3 text-base font-semibold">
        <span>Total</span>
        <span>{formatINR(total)}</span>
      </div>
    </div>
  );
}
