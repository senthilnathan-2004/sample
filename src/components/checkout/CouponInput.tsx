"use client";

import { useState } from "react";
import type { CheckoutItemInput } from "@/lib/pricing";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Coupon apply with server-side validation (never trusts a client discount).
export function CouponInput({
  items,
  applied,
  onApplied,
  onCleared,
}: {
  items: CheckoutItemInput[];
  applied?: { code: string; discount: number };
  onApplied: (code: string, discount: number) => void;
  onCleared: () => void;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function apply() {
    if (!code.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), items }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setOk(true);
        setMessage(data.message);
        onApplied(code.trim().toUpperCase(), data.discount);
      } else {
        setOk(false);
        setMessage(data.message || data.error || "Invalid coupon.");
      }
    } catch {
      setOk(false);
      setMessage("Could not validate coupon.");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-control border border-hairline bg-brand-tint px-3 py-2 text-sm">
        <span className="font-medium text-brand">{applied.code} applied</span>
        <button
          onClick={() => {
            onCleared();
            setCode("");
            setOk(false);
            setMessage("");
          }}
          className="text-brand hover:underline"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          aria-label="Coupon code"
        />
        <Button variant="secondary" onClick={apply} disabled={loading}>
          {loading ? "…" : "Apply"}
        </Button>
      </div>
      {message && (
        <p className={`mt-1 text-xs ${ok ? "text-success" : "text-warning"}`} aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
