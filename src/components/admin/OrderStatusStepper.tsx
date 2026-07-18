"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const FLOW = ["placed", "in_progress", "ready", "shipped", "delivered"];
const LABEL: Record<string, string> = {
  placed: "Placed",
  in_progress: "Being made",
  ready: "Ready",
  shipped: "Shipped",
  delivered: "Delivered",
};

// Advance fulfillment. Marking "shipped" requires tracking# + courier (also
// enforced server-side).
export function OrderStatusStepper({
  orderNumber,
  status,
  trackingNumber,
  courierName,
}: {
  orderNumber: string;
  status: string;
  trackingNumber?: string;
  courierName?: string;
}) {
  const router = useRouter();
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [courier, setCourier] = useState(courierName ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const idx = FLOW.indexOf(status);
  const nextStatus = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;

  async function advance(to: string) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/orders/${orderNumber}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentStatus: to, trackingNumber: tracking, courierName: courier }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not update.");
    router.refresh();
  }

  return (
    <div className="rounded-card border border-hairline bg-white p-4 shadow-card">
      <p className="mb-2 font-heading font-bold">Fulfillment</p>
      <div className="mb-3 flex flex-wrap gap-1 text-xs">
        {FLOW.map((s, i) => (
          <span
            key={s}
            className={`rounded px-2 py-1 ${i <= idx ? "bg-brand text-white" : "bg-cream text-muted"}`}
          >
            {LABEL[s]}
          </span>
        ))}
      </div>

      {status === "cancelled" ? (
        <p className="text-sm text-muted">This order was cancelled.</p>
      ) : (
        <>
          {(nextStatus === "shipped" || status === "shipped") && (
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              <label className="text-xs">
                Courier
                <Input value={courier} onChange={(e) => setCourier(e.target.value)} className="h-9" placeholder="India Post" />
              </label>
              <label className="text-xs">
                Tracking number
                <Input value={tracking} onChange={(e) => setTracking(e.target.value)} className="h-9" placeholder="TN123…" />
              </label>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {nextStatus && (
              <Button variant="primary" size="sm" onClick={() => advance(nextStatus)} disabled={busy}>
                Mark {LABEL[nextStatus]}
              </Button>
            )}
            {status !== "delivered" && (
              <Button variant="secondary" size="sm" onClick={() => advance("cancelled")} disabled={busy}>
                Cancel order
              </Button>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-warning">{error}</p>}
        </>
      )}
    </div>
  );
}
