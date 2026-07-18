import Link from "next/link";
import { getAdminSession } from "@/lib/adminAuth";
import { getAnalytics } from "@/lib/analytics";
import { dbConnect } from "@/lib/db";
import { Order, type OrderDoc } from "@/models/Order";
import { formatINR } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { StatusBadge } from "@/components/account/StatusBadge";
import { roleAtLeast } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  const canAnalytics = roleAtLeast(session?.role, "manager");

  const analytics = await getAnalytics();
  await dbConnect();
  const recent = await Order.find().sort({ createdAt: -1 }).limit(8).lean<OrderDoc[]>().exec();

  return (
    <div>
      <h1 className="font-heading text-2xl font-extrabold">Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Today's orders" value={String(analytics.stats.todayOrders)} />
        <StatCard label="Today's revenue" value={formatINR(analytics.stats.todayRevenue)} />
        <StatCard label="Pending / unshipped" value={String(analytics.stats.pending)} hint="placed · making · ready" />
        <StatCard label="Delivered (all time)" value={String(analytics.stats.delivered)} />
      </div>

      {canAnalytics && (
        <div className="mt-6">
          <AnalyticsCharts data={analytics} />
        </div>
      )}

      <div className="mt-6 rounded-card border border-hairline bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading font-bold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-muted">
                <th className="py-2 font-medium">Order</th>
                <th className="py-2 font-medium">Customer</th>
                <th className="py-2 font-medium">Total</th>
                <th className="py-2 font-medium">Payment</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.orderNumber} className="border-b border-hairline last:border-0 hover:bg-brand-tint-strong">
                  <td className="py-2">
                    <Link href={`/admin/orders/${o.orderNumber}`} className="font-accent text-brand hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="py-2">{o.customer.name}</td>
                  <td className="py-2">{formatINR(o.total)}</td>
                  <td className="py-2 capitalize">{o.paymentMethod} · {o.paymentStatus}</td>
                  <td className="py-2">
                    <StatusBadge status={o.fulfillmentStatus} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
