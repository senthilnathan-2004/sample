import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/account/coupons");

  await dbConnect();
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    $or: [{ expiry: { $gte: now } }, { expiry: { $exists: false } }, { expiry: null }],
  })
    .lean()
    .exec();

  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <Link href="/account" className="text-sm text-brand hover:underline">
        ← Your account
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-extrabold">Coupons &amp; offers</h1>

      {coupons.length === 0 ? (
        <p className="mt-6 text-muted">No offers available right now. Check back soon!</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="rounded-card border-2 border-dashed border-brand bg-brand-tint p-4"
            >
              <p className="font-accent text-lg font-bold text-brand">{c.code}</p>
              <p className="mt-1 text-sm">
                {c.type === "percentage" ? `${c.value}% off` : `${formatINR(c.value)} off`}
                {c.minOrderValue ? ` on orders over ${formatINR(c.minOrderValue)}` : ""}
              </p>
              {c.expiry && (
                <p className="mt-1 text-xs text-muted">
                  Valid till{" "}
                  {new Date(c.expiry).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
              <p className="mt-2 text-xs text-muted">Apply at checkout.</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
