import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { getMyOrders } from "@/lib/account";
import { OrderCard } from "@/components/account/OrderCard";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/account/orders");
  const orders = await getMyOrders();

  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <Link href="/account" className="text-sm text-brand hover:underline">
        ← Your account
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-extrabold">Your orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8 grid place-items-center gap-4 rounded-card border border-hairline py-16 text-center">
          <p className="text-lg">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop">
            <Button variant="primary">Start shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {orders.map((o) => (
            <OrderCard key={o.orderNumber} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
