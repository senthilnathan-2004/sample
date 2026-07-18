import { CouponsAdmin } from "@/components/admin/CouponsAdmin";

export const dynamic = "force-dynamic";

export default function AdminCoupons() {
  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-extrabold">Coupons</h1>
      <CouponsAdmin />
    </div>
  );
}
