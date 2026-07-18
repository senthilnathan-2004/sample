"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderSummaryDTO } from "@/lib/account";
import { formatINR } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { useCart } from "@/store/cartStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function OrderCard({ order }: { order: OrderSummaryDTO }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [buyAgainMsg, setBuyAgainMsg] = useState(false);

  const canCancel = ["placed", "in_progress"].includes(order.fulfillmentStatus);
  const delivered = order.fulfillmentStatus === "delivered";
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const buyAgain = () => {
    for (const i of order.items) {
      const v = (i.variant ?? {}) as { color?: string; size?: string };
      addItem({
        key: `${i.productId}:${v.color ?? ""}|${v.size ?? ""}|`,
        productId: i.productId,
        slug: "",
        name: i.name,
        variant: { color: v.color ?? "", size: v.size },
        unitPrice: i.price,
        quantity: i.quantity,
        leadTimeDays: 4,
      });
    }
    setBuyAgainMsg(true);
    setTimeout(() => setBuyAgainMsg(false), 2000);
  };

  async function cancel() {
    await fetch(`/api/orders/${order.orderNumber}/cancel`, { method: "POST" });
    setConfirmCancel(false);
    router.refresh();
  }

  return (
    <div className="rounded-card border border-hairline p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-2 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span>
            <span className="text-muted">Order </span>
            <span className="font-accent font-semibold">{order.orderNumber}</span>
          </span>
          <span className="text-muted">Placed {date}</span>
          <span className="font-medium">{formatINR(order.total)}</span>
        </div>
        <StatusBadge status={order.fulfillmentStatus} />
      </div>

      <div className="mt-3 text-sm">
        {order.items.map((i, idx) => (
          <p key={idx}>
            {i.name}{" "}
            <span className="text-muted">
              × {i.quantity} · {formatINR(i.price * i.quantity)}
            </span>
          </p>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/account/orders/${order.orderNumber}/track`}
          className="rounded-control border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-tint"
        >
          Track
        </Link>
        <Link
          href={`/account/orders/${order.orderNumber}`}
          className="rounded-control border border-hairline px-3 py-1.5 text-sm font-medium hover:bg-brand-tint"
        >
          View details
        </Link>
        <button
          onClick={buyAgain}
          className="rounded-control bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-hover"
        >
          {buyAgainMsg ? "Added ✓" : "Buy again"}
        </button>
        {delivered && (
          <Link
            href="/account/reviews"
            className="rounded-control border border-hairline px-3 py-1.5 text-sm font-medium hover:bg-brand-tint"
          >
            Write a review
          </Link>
        )}
        {canCancel && (
          <button
            onClick={() => setConfirmCancel(true)}
            className="rounded-control px-3 py-1.5 text-sm font-medium text-warning hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message="Made-to-order items can be cancelled before they ship."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        onConfirm={cancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
