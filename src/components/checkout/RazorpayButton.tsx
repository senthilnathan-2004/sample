"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { CreateOrderInput } from "@/lib/validate";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Opens Razorpay Checkout. The order + rz order are created server-side; on the
 * client callback we route to a "verifying payment" success state — we do NOT
 * mark the order paid here (only the webhook does).
 */
export function RazorpayButton({
  buildPayload,
  onCartClear,
  disabled,
}: {
  buildPayload: () => CreateOrderInput | null;
  onCartClear: () => void;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    const payload = buildPayload();
    if (!payload) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start payment.");
        setBusy(false);
        return;
      }

      const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!loaded || !window.Razorpay) {
        setError("Payment SDK failed to load.");
        setBusy(false);
        return;
      }

      const rz = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Lara's Pinnal",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { name: payload.customer.name, contact: payload.customer.phone, email: payload.customer.email },
        theme: { color: "#D2388D" },
        handler: () => {
          // Payment confirmation happens via webhook; show verifying state.
          onCartClear();
          router.push(`/checkout/success?order=${data.orderNumber}&verifying=1`);
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
      rz.open();
    } catch {
      setError("Something went wrong starting payment.");
      setBusy(false);
    }
  }

  return (
    <div>
      <Button variant="primary" className="w-full" onClick={pay} disabled={disabled || busy}>
        {busy ? "Starting payment…" : "Pay securely"}
      </Button>
      {error && <p className="mt-2 text-sm text-warning">{error}</p>}
    </div>
  );
}
