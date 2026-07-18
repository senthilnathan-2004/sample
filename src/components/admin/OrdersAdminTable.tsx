"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/account/StatusBadge";
import { Input } from "@/components/ui/Input";

type Row = {
  orderNumber: string;
  createdAt: string;
  customer: { name: string; phone: string };
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  fulfillmentStatus: string;
};

const STATUSES = ["all", "placed", "in_progress", "ready", "shipped", "delivered", "cancelled"];

export function OrdersAdminTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (status !== "all") sp.set("status", status);
    if (q.trim()) sp.set("q", q.trim());
    const res = await fetch(`/api/admin/orders?${sp.toString()}`);
    if (res.ok) setRows((await res.json()).orders);
    setLoading(false);
  }, [status, q]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm capitalize ${
                status === s ? "border-brand bg-brand-tint text-brand" : "border-hairline"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order # / phone / name"
          className="max-w-xs"
        />
      </div>

      <div className="overflow-x-auto rounded-card border border-hairline bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-muted">
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Payment</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.orderNumber} className="border-b border-hairline last:border-0 hover:bg-brand-tint-strong">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.orderNumber}`} className="font-accent text-brand hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="p-3">
                  {o.customer.name}
                  <span className="block text-xs text-muted">{o.customer.phone}</span>
                </td>
                <td className="p-3">{formatINR(o.total)}</td>
                <td className="p-3 capitalize">
                  {o.paymentMethod} · {o.paymentStatus}
                </td>
                <td className="p-3">
                  <StatusBadge status={o.fulfillmentStatus} />
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">
                  No orders match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
