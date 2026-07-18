import { OrdersAdminTable } from "@/components/admin/OrdersAdminTable";

export const dynamic = "force-dynamic";

export default function AdminOrders() {
  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-extrabold">Orders</h1>
      <OrdersAdminTable />
    </div>
  );
}
