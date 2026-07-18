import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { getMyOrder } from "@/lib/account";
import { formatINR, deliveryDateLabel } from "@/lib/format";
import { StatusBadge } from "@/components/account/StatusBadge";
import { StatusTimeline } from "@/components/account/StatusTimeline";
import { PrintButton } from "@/components/account/PrintButton";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect(`/login?next=/account/orders/${params.orderNumber}`);
  const order = await getMyOrder(params.orderNumber);
  if (!order) notFound();

  const addr = order.shippingAddress as Record<string, string>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="no-print">
        <Link href="/account/orders" className="text-sm text-brand hover:underline">
          ← Your orders
        </Link>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.fulfillmentStatus} />
          <PrintButton />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Delivery + contact */}
        <section className="rounded-card border border-hairline p-4 shadow-card">
          <h2 className="mb-2 font-heading font-bold">Delivery address</h2>
          <p className="text-sm">{addr.fullName}</p>
          <p className="text-sm text-muted">
            {addr.line1}
            {addr.line2 ? `, ${addr.line2}` : ""}
            {addr.landmark ? `, ${addr.landmark}` : ""}, {addr.city}, {addr.state} {addr.pincode}
          </p>
          <p className="mt-1 text-sm text-muted">Phone: {addr.phone}</p>
          {order.customer.email && (
            <p className="text-sm text-muted">Email: {order.customer.email}</p>
          )}
        </section>

        {/* Payment + estimate */}
        <section className="rounded-card border border-hairline p-4 shadow-card">
          <h2 className="mb-2 font-heading font-bold">Payment</h2>
          <p className="text-sm capitalize">
            {order.paymentMethod === "cod" ? "Cash on delivery" : "Online (Razorpay)"} ·{" "}
            <span className="capitalize">{order.paymentStatus}</span>
          </p>
          {order.estimatedReadyBy && (
            <p className="mt-2 text-sm">
              <span className="text-muted">Estimated ready by: </span>
              {deliveryDateLabel(0, new Date(order.estimatedReadyBy))}
            </p>
          )}
        </section>
      </div>

      {/* Items + price breakdown (invoice) */}
      <section className="mt-6 rounded-card border border-hairline p-4 shadow-card">
        <h2 className="mb-3 font-heading font-bold">Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-muted">
              <th className="py-1 font-medium">Item</th>
              <th className="py-1 text-center font-medium">Qty</th>
              <th className="py-1 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i, idx) => {
              const v = (i.variant ?? {}) as { color?: string; size?: string };
              return (
                <tr key={idx} className="border-b border-hairline">
                  <td className="py-2">
                    {i.name}
                    {v.color ? (
                      <span className="text-muted">
                        {" "}
                        ({v.color}
                        {v.size ? `, ${v.size}` : ""})
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 text-center">{i.quantity}</td>
                  <td className="py-2 text-right">{formatINR(i.price * i.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <dl className="mt-3 grid gap-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatINR(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
              <dd>−{formatINR(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-hairline pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
        </dl>
      </section>

      {/* Tracking summary */}
      <section className="mt-6 rounded-card border border-hairline p-4 shadow-card no-print">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading font-bold">Tracking</h2>
          <Link
            href={`/account/orders/${order.orderNumber}/track`}
            className="text-sm text-brand hover:underline"
          >
            Full tracking →
          </Link>
        </div>
        <StatusTimeline
          status={order.fulfillmentStatus}
          history={order.statusHistory}
          courierName={order.courierName}
          trackingNumber={order.trackingNumber}
        />
      </section>
    </div>
  );
}
