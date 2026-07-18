"use client";

import { useState } from "react";

export function NotificationToggles({
  initial,
}: {
  initial: { whatsapp: boolean; email: boolean };
}) {
  const [prefs, setPrefs] = useState(initial);
  const [status, setStatus] = useState("");

  async function update(next: { whatsapp: boolean; email: boolean }) {
    setPrefs(next);
    setStatus("");
    const res = await fetch("/api/account/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setStatus(res.ok ? "Saved ✓" : "Could not save.");
  }

  const Row = ({ label, k, desc }: { label: string; k: "whatsapp" | "email"; desc: string }) => (
    <label className="flex items-center justify-between gap-4 border-b border-hairline py-3 last:border-0">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={prefs[k]}
        onChange={(e) => update({ ...prefs, [k]: e.target.checked })}
        className="h-5 w-5 accent-brand"
      />
    </label>
  );

  return (
    <div className="rounded-card border border-hairline p-5 shadow-card">
      <Row label="WhatsApp updates" k="whatsapp" desc="Order confirmations, shipping, delivery." />
      <Row label="Email updates" k="email" desc="Receipts and order status by email." />
      {status && <p className="mt-3 text-sm text-success" aria-live="polite">{status}</p>}
    </div>
  );
}
