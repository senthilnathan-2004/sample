"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusTimeline, STATUS_LABEL } from "@/components/account/StatusTimeline";

type TrackResult = {
  orderNumber: string;
  fulfillmentStatus: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedReadyBy?: string;
  statusHistory: { status: string; at: string; note?: string }[];
  items: { name: string; quantity: number }[];
};

export function GuestTrackClient({ initialOrder = "" }: { initialOrder?: string }) {
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function track() {
    setBusy(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: orderNumber.trim(), phone: phone.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not find that order.");
      return;
    }
    setResult(data);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-heading text-2xl font-extrabold">Track your order</h1>
      <p className="mt-1 text-sm text-muted">
        Enter your order number and the phone number on the order.
      </p>

      <div className="mt-6 grid gap-3 rounded-card border border-hairline p-5 shadow-card sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Order number</label>
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="LP-2026-0001"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <Input
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit phone"
          />
        </div>
        <div className="sm:col-span-2">
          <Button variant="primary" onClick={track} disabled={busy || !orderNumber || phone.length !== 10}>
            {busy ? "Checking…" : "Track order"}
          </Button>
          {error && (
            <p className="mt-2 text-sm text-warning" role="alert" aria-live="assertive">
              {error}
            </p>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-6 rounded-card border border-hairline p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-accent text-sm font-semibold">{result.orderNumber}</span>
            <span className="text-sm font-medium text-brand">
              {STATUS_LABEL[result.fulfillmentStatus] ?? result.fulfillmentStatus}
            </span>
          </div>
          <StatusTimeline
            status={result.fulfillmentStatus}
            history={result.statusHistory}
            courierName={result.courierName}
            trackingNumber={result.trackingNumber}
          />
          <div className="mt-4 border-t border-hairline pt-3 text-sm text-muted">
            {result.items.map((i, idx) => (
              <p key={idx}>
                {i.name} × {i.quantity}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
