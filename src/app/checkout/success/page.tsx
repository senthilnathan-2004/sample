import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";
import { Button } from "@/components/ui/Button";
import { formatINR, deliveryDateLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; verifying?: string };
}) {
  const orderNumber = searchParams.order;
  const verifying = searchParams.verifying === "1";

  let order: OrderDoc | null = null;
  if (orderNumber) {
    try {
      await dbConnect();
      order = await Order.findOne({ orderNumber }).lean<OrderDoc>().exec();
    } catch {
      /* ignore — show generic success */
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-tint text-3xl">
        🧶
      </div>
      <h1 className="mt-4 font-heading text-2xl font-extrabold">Thank you for your order!</h1>

      {orderNumber && (
        <p className="mt-2 text-muted">
          Order number <span className="font-accent font-semibold text-ink">{orderNumber}</span>
        </p>
      )}

      {verifying && (
        <p className="mt-3 rounded-control bg-brand-tint px-3 py-2 text-sm text-brand" aria-live="polite">
          We&apos;re verifying your payment. Your order status will update automatically once
          confirmed.
        </p>
      )}

      {order && (
        <div className="mx-auto mt-6 max-w-sm rounded-card border border-hairline p-4 text-left text-sm shadow-card">
          <div className="flex justify-between">
            <span className="text-muted">Total</span>
            <span className="font-semibold">{formatINR(order.total)}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted">Payment</span>
            <span className="capitalize">
              {order.paymentMethod === "cod" ? "Cash on delivery" : "Online"} · {order.paymentStatus}
            </span>
          </div>
          {order.estimatedReadyBy && (
            <div className="mt-2 flex justify-between">
              <span className="text-muted">Estimated ready by</span>
              <span>{deliveryDateLabel(0, new Date(order.estimatedReadyBy))}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
        {orderNumber && (
          <Link href={`/track?order=${orderNumber}`}>
            <Button variant="secondary">Track order</Button>
          </Link>
        )}
        <Link href="/shop">
          <Button variant="primary">Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}
