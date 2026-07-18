"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";

type Row = {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: number;
  minOrderValue: number;
  expiry?: string;
  isActive: boolean;
};

export function CouponsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [f, setF] = useState({ code: "", type: "percentage", value: 10, minOrderValue: 0, expiry: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setRows((await res.json()).coupons);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    setError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, value: Number(f.value), minOrderValue: Number(f.minOrderValue) }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Could not add.");
    setF({ code: "", type: "percentage", value: 10, minOrderValue: 0, expiry: "" });
    load();
  }
  async function toggle(r: Row) {
    await fetch(`/api/admin/coupons/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !r.isActive }),
    });
    load();
  }
  async function del(id: string) {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="rounded-card border border-hairline bg-white p-4 shadow-card">
        <p className="mb-2 font-heading font-bold">New coupon</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs">Code<Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} className="h-9 w-32" /></label>
          <label className="text-xs">Type
            <Select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="h-9">
              <option value="percentage">% off</option>
              <option value="flat">₹ off</option>
            </Select>
          </label>
          <label className="text-xs">Value<Input type="number" value={f.value} onChange={(e) => setF({ ...f, value: Number(e.target.value) })} className="h-9 w-24" /></label>
          <label className="text-xs">Min order ₹<Input type="number" value={f.minOrderValue} onChange={(e) => setF({ ...f, minOrderValue: Number(e.target.value) })} className="h-9 w-28" /></label>
          <label className="text-xs">Expiry<Input type="date" value={f.expiry} onChange={(e) => setF({ ...f, expiry: e.target.value })} className="h-9" /></label>
          <Button variant="primary" onClick={add}>Add</Button>
        </div>
        {error && <p className="mt-2 text-sm text-warning">{error}</p>}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <div key={c.id} className="rounded-card border border-hairline bg-white p-3 shadow-card">
            <div className="flex items-center justify-between">
              <span className="font-accent font-bold text-brand">{c.code}</span>
              <span className={c.isActive ? "text-xs text-success" : "text-xs text-muted"}>{c.isActive ? "Active" : "Off"}</span>
            </div>
            <p className="text-sm">
              {c.type === "percentage" ? `${c.value}% off` : `${formatINR(c.value)} off`}
              {c.minOrderValue ? ` · min ${formatINR(c.minOrderValue)}` : ""}
            </p>
            <div className="mt-2 flex gap-3 text-sm">
              <button onClick={() => toggle(c)} className="text-brand hover:underline">{c.isActive ? "Disable" : "Enable"}</button>
              <button onClick={() => del(c.id)} className="text-warning hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
