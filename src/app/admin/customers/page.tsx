import Link from "next/link";
import { adminListCustomers } from "@/lib/adminData";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomers({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const customers = await adminListCustomers(searchParams.q);

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-extrabold">Customers</h1>
      <form className="mb-3">
        <input
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="Search name / email / phone"
          className="h-10 w-full max-w-sm rounded-control border border-hairline px-3 text-sm focus:border-brand"
        />
      </form>
      <div className="overflow-x-auto rounded-card border border-hairline bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-muted">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Orders</th>
              <th className="p-3 font-medium">Lifetime value</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-hairline last:border-0 hover:bg-brand-tint-strong">
                <td className="p-3">
                  <Link href={`/admin/customers/${c.id}`} className="text-brand hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="p-3 text-muted">
                  {c.email ?? ""} {c.phone ?? ""}
                </td>
                <td className="p-3">{c.orders}</td>
                <td className="p-3">{formatINR(c.ltv)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
