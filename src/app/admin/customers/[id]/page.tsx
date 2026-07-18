import Link from "next/link";
import { notFound } from "next/navigation";
import { adminCustomerDetail } from "@/lib/adminData";
import { formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/account/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetail({ params }: { params: { id: string } }) {
  const c = await adminCustomerDetail(params.id);
  if (!c) notFound();

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-brand hover:underline">
        ← Customers
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-extrabold">{c.name}</h1>
      <p className="text-sm text-muted">
        {c.email ?? "no email"} · {c.phone ?? "no phone"}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-hairline bg-white p-4 shadow-card">
          <h2 className="mb-2 font-heading font-bold">Addresses</h2>
          {c.addresses.length === 0 ? (
            <p className="text-sm text-muted">No saved addresses.</p>
          ) : (
            c.addresses.map((a, i) => (
              <p key={i} className="text-sm text-muted">
                {a.fullName} — {a.line1}, {a.city}, {a.state} {a.pincode} ({a.type})
              </p>
            ))
          )}
        </section>

        <section className="rounded-card border border-hairline bg-white p-4 shadow-card">
          <h2 className="mb-2 font-heading font-bold">Orders ({c.orders.length})</h2>
          {c.orders.map((o) => (
            <div key={o.orderNumber} className="flex items-center justify-between border-b border-hairline py-2 text-sm last:border-0">
              <Link href={`/admin/orders/${o.orderNumber}`} className="font-accent text-brand hover:underline">
                {o.orderNumber}
              </Link>
              <span>{formatINR(o.total)}</span>
              <StatusBadge status={o.status} />
            </div>
          ))}
          {c.orders.length === 0 && <p className="text-sm text-muted">No orders.</p>}
        </section>
      </div>
    </div>
  );
}
