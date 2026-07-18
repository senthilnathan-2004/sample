"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, selectSubtotal } from "@/store/cartStore";
import { useHasMounted } from "@/lib/useHasMounted";
import { shippingFor } from "@/lib/commerce";
import { formatINR } from "@/lib/format";
import type { CheckoutItemInput } from "@/lib/pricing";
import type { CreateOrderInput } from "@/lib/validate";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { PriceDetails } from "@/components/cart/PriceDetails";
import { AddressForm, emptyAddress, type AddressValue } from "./AddressForm";
import { CouponInput } from "./CouponInput";
import { RazorpayButton } from "./RazorpayButton";

type AddrErrors = Partial<Record<keyof AddressValue, string>>;

export function CheckoutClient({
  razorpayEnabled,
  codEnabled,
}: {
  razorpayEnabled: boolean;
  codEnabled: boolean;
}) {
  const router = useRouter();
  const mounted = useHasMounted();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const clearCart = useCart((s) => s.clear);

  const [address, setAddress] = useState<AddressValue>(emptyAddress);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<AddrErrors>({});
  const [applied, setApplied] = useState<{ code: string; discount: number } | undefined>();
  const [method, setMethod] = useState<"razorpay" | "cod">(
    razorpayEnabled ? "razorpay" : "cod",
  );
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const checkoutItems: CheckoutItemInput[] = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        variant: i.variant,
        quantity: i.quantity,
        customText: i.customText,
      })),
    [items],
  );

  const discount = applied?.discount ?? 0;
  const shipping = shippingFor(Math.max(0, subtotal - discount));

  function validate(): boolean {
    const e: AddrErrors = {};
    if (address.fullName.trim().length < 2) e.fullName = "Enter your name";
    if (!/^\d{10}$/.test(address.phone)) e.phone = "Enter a 10-digit phone";
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = "Enter a 6-digit pincode";
    if (address.line1.trim().length < 3) e.line1 = "Enter your address";
    if (address.city.trim().length < 2) e.city = "Enter city";
    if (address.state.trim().length < 2) e.state = "Enter state";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildPayload(): CreateOrderInput | null {
    if (!validate()) {
      document.getElementById("address-section")?.scrollIntoView({ behavior: "smooth" });
      return null;
    }
    return {
      customer: { name: address.fullName, phone: address.phone, email: email || "" },
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || "",
        landmark: address.landmark || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        type: address.type,
      },
      items: checkoutItems,
      couponCode: applied?.code || "",
      paymentMethod: method,
    };
  }

  async function placeCod() {
    const payload = buildPayload();
    if (!payload) return;
    setPlacing(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Could not place order.");
        setPlacing(false);
        return;
      }
      clearCart();
      router.push(`/checkout/success?order=${data.orderNumber}`);
    } catch {
      setSubmitError("Something went wrong.");
      setPlacing(false);
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-page px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-page px-4 py-16 text-center">
        <p className="text-lg">Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block">
          <Button variant="primary">Start shopping</Button>
        </Link>
      </div>
    );
  }

  const placeButton =
    method === "razorpay" ? (
      <RazorpayButton buildPayload={buildPayload} onCartClear={clearCart} disabled={placing} />
    ) : (
      <Button variant="primary" className="w-full" onClick={placeCod} disabled={placing}>
        {placing ? "Placing order…" : `Place order · ${formatINR(Math.max(0, subtotal - discount) + shipping)}`}
      </Button>
    );

  return (
    <div className="mx-auto max-w-page px-4 py-6 pb-28 lg:pb-6">
      <h1 className="font-heading text-2xl font-extrabold">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          {/* 1. Address */}
          <section id="address-section" className="rounded-card border border-hairline p-4 shadow-card">
            <h2 className="mb-3 font-heading text-lg font-bold">1 · Delivery address</h2>
            <AddressForm
              value={address}
              errors={errors}
              onChange={(patch) => setAddress((a) => ({ ...a, ...patch }))}
            />
            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium">Email (optional)</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </section>

          {/* 2. Review */}
          <section className="mt-5 rounded-card border border-hairline p-4 shadow-card">
            <h2 className="mb-3 font-heading text-lg font-bold">2 · Review items</h2>
            <ul className="grid gap-2">
              {items.map((i) => (
                <li key={i.key} className="flex justify-between text-sm">
                  <span className="min-w-0">
                    <span className="font-medium">{i.name}</span>{" "}
                    <span className="text-muted">
                      ({i.variant.color}
                      {i.variant.size ? `, ${i.variant.size}` : ""}) × {i.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatINR(i.unitPrice * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Payment */}
          <section className="mt-5 rounded-card border border-hairline p-4 shadow-card">
            <h2 className="mb-3 font-heading text-lg font-bold">3 · Payment</h2>
            <div className="grid gap-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-control border p-3 ${
                  method === "razorpay" ? "border-brand bg-brand-tint" : "border-hairline"
                } ${!razorpayEnabled ? "opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="method"
                  className="accent-brand"
                  checked={method === "razorpay"}
                  disabled={!razorpayEnabled}
                  onChange={() => setMethod("razorpay")}
                />
                <span className="text-sm font-medium">
                  Pay online (UPI / card / netbanking)
                  {!razorpayEnabled && (
                    <span className="block text-xs font-normal text-muted">
                      Currently unavailable — configure Razorpay keys.
                    </span>
                  )}
                </span>
              </label>
              {codEnabled && (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-control border p-3 ${
                    method === "cod" ? "border-brand bg-brand-tint" : "border-hairline"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    className="accent-brand"
                    checked={method === "cod"}
                    onChange={() => setMethod("cod")}
                  />
                  <span className="text-sm font-medium">Cash on delivery</span>
                </label>
              )}
            </div>
            {submitError && <p className="mt-3 text-sm text-warning">{submitError}</p>}
          </section>
        </div>

        {/* Summary (desktop sticky) */}
        <aside className="hidden h-fit lg:sticky lg:top-24 lg:block">
          <PriceDetails
            subtotal={subtotal}
            discount={discount}
            shipping={shipping}
            couponCode={applied?.code}
          />
          <div className="mt-3">
            <CouponInput
              items={checkoutItems}
              applied={applied}
              onApplied={(code, d) => setApplied({ code, discount: d })}
              onCleared={() => setApplied(undefined)}
            />
          </div>
          <div className="mt-3">{placeButton}</div>
        </aside>
      </div>

      {/* Mobile sticky place-order bar (above the tab bar) */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-hairline bg-white p-3 lg:hidden">
        <div className="mb-2">
          <CouponInput
            items={checkoutItems}
            applied={applied}
            onApplied={(code, d) => setApplied({ code, discount: d })}
            onCleared={() => setApplied(undefined)}
          />
        </div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">Total</span>
          <span className="font-semibold">
            {formatINR(Math.max(0, subtotal - discount) + shipping)}
          </span>
        </div>
        {placeButton}
      </div>
    </div>
  );
}
