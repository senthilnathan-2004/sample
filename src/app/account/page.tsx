import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyAccount, getMyOrders } from "@/lib/account";
import { formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/account/StatusBadge";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account", robots: { index: false } };

const HUB = [
  { label: "Your Orders", href: "/account/orders", icon: "📦", desc: "Track, return, buy again" },
  { label: "Addresses", href: "/account/addresses", icon: "📍", desc: "Saved delivery addresses" },
  { label: "Login & security", href: "/account/profile", icon: "🔒", desc: "Name, password, contact" },
  { label: "Buy Again", href: "/account/buy-again", icon: "🔁", desc: "Reorder past purchases" },
  { label: "Wishlist", href: "/wishlist", icon: "❤️", desc: "Saved items" },
  { label: "Coupons", href: "/account/coupons", icon: "🎟️", desc: "Available offers" },
  { label: "Your Reviews", href: "/account/reviews", icon: "⭐", desc: "Reviews you wrote" },
  { label: "Notifications", href: "/account/notifications", icon: "🔔", desc: "Update preferences" },
];

export default async function AccountHub() {
  const account = await getMyAccount();
  if (!account) redirect("/login?next=/account");
  const orders = await getMyOrders();
  const lastOrder = orders[0];

  return (
    <div className="mx-auto max-w-page px-4 py-8">
      <h1 className="font-heading text-2xl font-extrabold">
        Hello, {account.name?.split(" ")[0]}
      </h1>

      {lastOrder && (
        <section className="mt-4 rounded-card border border-hairline p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted">Your last order</p>
              <p className="font-accent text-sm font-semibold">{lastOrder.orderNumber}</p>
              <p className="mt-1 text-sm">
                {lastOrder.firstItem?.name}
                {lastOrder.itemCount > 1 ? ` + ${lastOrder.itemCount - 1} more` : ""} ·{" "}
                {formatINR(lastOrder.total)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={lastOrder.fulfillmentStatus} />
              <Link
                href={`/account/orders/${lastOrder.orderNumber}/track`}
                className="rounded-control border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-tint"
              >
                Track
              </Link>
              <Link
                href={`/account/orders/${lastOrder.orderNumber}`}
                className="rounded-control bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-hover"
              >
                Details
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HUB.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-card border border-hairline p-4 shadow-card transition-shadow hover:shadow-[0_4px_18px_rgba(48,24,18,0.10)]"
          >
            <span className="text-2xl" aria-hidden>
              {c.icon}
            </span>
            <p className="mt-2 font-heading font-bold">{c.label}</p>
            <p className="text-sm text-muted">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
