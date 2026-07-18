"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";

type Row = {
  id: string;
  productName: string;
  name: string;
  rating: number;
  text: string;
  isApproved: boolean;
  verifiedPurchase: boolean;
};

export function ReviewsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [pendingOnly, setPendingOnly] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/reviews${pendingOnly ? "?pending=1" : ""}`);
    if (res.ok) setRows((await res.json()).reviews);
  }, [pendingOnly]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject") {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setPendingOnly(true)} className={`rounded-full border px-3 py-1.5 text-sm ${pendingOnly ? "border-brand bg-brand-tint text-brand" : "border-hairline"}`}>
          Pending
        </button>
        <button onClick={() => setPendingOnly(false)} className={`rounded-full border px-3 py-1.5 text-sm ${!pendingOnly ? "border-brand bg-brand-tint text-brand" : "border-hairline"}`}>
          All
        </button>
      </div>
      <div className="grid gap-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-card border border-hairline bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.productName}</span>
              <span className="text-brand">{"★".repeat(r.rating)}</span>
            </div>
            <p className="text-sm text-muted">
              by {r.name} {r.verifiedPurchase && <span className="text-success">· verified</span>}
              {r.isApproved && <span className="text-success"> · published</span>}
            </p>
            {r.text && <p className="mt-1 text-sm">{r.text}</p>}
            {!r.isApproved && (
              <div className="mt-2 flex gap-2">
                <Button variant="primary" size="sm" onClick={() => act(r.id, "approve")}>
                  Approve
                </Button>
                <Button variant="secondary" size="sm" onClick={() => act(r.id, "reject")}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && <p className="text-muted">No reviews.</p>}
      </div>
    </div>
  );
}
