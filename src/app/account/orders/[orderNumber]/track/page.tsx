import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { getMyOrder } from "@/lib/account";
import { formatINR, deliveryDateLabel } from "@/lib/format";
import { StatusTimeline } from "@/components/account/StatusTimeline";
import { StatusBadge } from "@/components/account/StatusBadge";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect(`/login?next=/account/orders/${params.orderNumber}/track`);
  const order = await getMyOrder(params.orderNumber);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href={`/account/orders/${order.orderNumber}`} className="text-sm text-brand hover:underline">
        ← Order details
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold">Track order</h1>
        <StatusBadge status={order.fulfillmentStatus} />
      </div>
      <p className="mt-1 font-accent text-sm text-muted">{order.orderNumber}</p>

      {order.estimatedReadyBy && order.fulfillmentStatus !== "delivered" && (
        <p className="mt-3 rounded-control bg-brand-tint px-3 py-2 text-sm text-brand">
          Estimated ready by {deliveryDateLabel(0, new Date(order.estimatedReadyBy))}
        </p>
      )}

      <div className="mt-6 rounded-card border border-hairline p-5 shadow-card">
        <StatusTimeline
          status={order.fulfillmentStatus}
          history={order.statusHistory}
          courierName={order.courierName}
          trackingNumber={order.trackingNumber}
        />
      </div>

      <div className="mt-4 rounded-card border border-hairline p-4 text-sm shadow-card">
        <p className="font-medium">In this order</p>
        {order.items.map((i, idx) => (
          <p key={idx} className="text-muted">
            {i.name} × {i.quantity} · {formatINR(i.price * i.quantity)}
          </p>
        ))}
      </div>
    </div>
  );
}
