import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";
import { formatINR, deliveryDateLabel } from "@/lib/format";
import { StatusBadge } from "@/components/account/StatusBadge";
import { StatusTimeline } from "@/components/account/StatusTimeline";
import { OrderStatusStepper } from "@/components/admin/OrderStatusStepper";
import { PrintButton } from "@/components/account/PrintButton";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: { orderNumber: string } }) {
  await dbConnect();
  const order = await Order.findOne({ orderNumber: params.orderNumber }).lean<OrderDoc>().exec();
  if (!order) notFound();
  const addr = order.shippingAddress as Record<string, string>;

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href="/admin/orders" className="text-sm text-brand hover:underline">
          ← Orders
        </Link>
        <PrintButton label="Print packing slip / invoice" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-2xl font-extrabold">{order.orderNumber}</h1>
        <StatusBadge status={order.fulfillmentStatus} />
      </div>
      <p className="text-sm text-muted">
        Placed {new Date(order.createdAt).toLocaleString("en-IN")} · {order.paymentMethod.toUpperCase()} ·{" "}
        <span className="capitalize">{order.paymentStatus}</span>
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          <section className="rounded-card border border-hairline bg-white p-4 shadow-card">
            <h2 className="mb-2 font-heading font-bold">Ship to</h2>
            <p className="text-sm">{addr.fullName}</p>
            <p className="text-sm text-muted">
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}
              {addr.landmark ? `, ${addr.landmark}` : ""}, {addr.city}, {addr.state} {addr.pincode}
            </p>
            <p className="mt-1 text-sm text-muted">Phone: {addr.phone}</p>
            {order.customer.email && <p className="text-sm text-muted">Email: {order.customer.email}</p>}
            {order.estimatedReadyBy && (
              <p className="mt-2 text-sm">
                <span className="text-muted">Est. ready by: </span>
                {deliveryDateLabel(0, new Date(order.estimatedReadyBy))}
              </p>
            )}
          </section>

          <section className="rounded-card border border-hairline bg-white p-4 shadow-card">
            <h2 className="mb-2 font-heading font-bold">Items</h2>
            <table className="w-full text-sm">
              <tbody>
                {order.items.map((i, idx) => {
                  const v = (i.variant ?? {}) as { color?: string; size?: string };
                  return (
                    <tr key={idx} className="border-b border-hairline last:border-0">
                      <td className="py-2">
                        {i.name}
                        {v.color ? <span className="text-muted"> ({v.color}{v.size ? `, ${v.size}` : ""})</span> : null}
                        {i.customText ? <span className="text-muted"> · “{i.customText}”</span> : null}
                      </td>
                      <td className="py-2 text-center">×{i.quantity}</td>
                      <td className="py-2 text-right">{formatINR(i.price * i.quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <dl className="mt-3 grid gap-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success"><dt>Discount</dt><dd>−{formatINR(order.discount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd></div>
              <div className="flex justify-between border-t border-hairline pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
            </dl>
          </section>

          <section className="rounded-card border border-hairline bg-white p-4 shadow-card no-print">
            <h2 className="mb-3 font-heading font-bold">Tracking history</h2>
            <StatusTimeline
              status={order.fulfillmentStatus}
              history={order.statusHistory.map((s) => ({ status: s.status, at: s.at, note: s.note }))}
              courierName={order.courierName}
              trackingNumber={order.trackingNumber}
            />
          </section>
        </div>

        <div className="no-print">
          <OrderStatusStepper
            orderNumber={order.orderNumber}
            status={order.fulfillmentStatus}
            trackingNumber={order.trackingNumber}
            courierName={order.courierName}
          />
        </div>
      </div>
    </div>
  );
}
