"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminRole } from "@/lib/rbac";
import { CAN } from "@/lib/rbac";
import { cn } from "@/lib/cn";

const NAV: { label: string; href: string; can: (r?: AdminRole) => boolean }[] = [
  { label: "Dashboard", href: "/admin", can: () => true },
  { label: "Products", href: "/admin/products", can: CAN.products },
  { label: "Categories", href: "/admin/categories", can: CAN.categories },
  { label: "Orders", href: "/admin/orders", can: CAN.orders },
  { label: "Customers", href: "/admin/customers", can: CAN.customers },
  { label: "Reviews", href: "/admin/reviews", can: CAN.reviews },
  { label: "Coupons", href: "/admin/coupons", can: CAN.coupons },
  { label: "Content / CMS", href: "/admin/content", can: CAN.content },
  { label: "Pages", href: "/admin/pages", can: CAN.pages },
  { label: "Admin users", href: "/admin/users", can: CAN.users },
  { label: "My account", href: "/admin/account", can: () => true },
];

export function AdminShell({
  role,
  name,
  children,
}: {
  role: AdminRole;
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => n.can(role));

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <nav className="flex h-full flex-col">
      <div className="px-4 py-4">
        <p className="font-heading text-lg font-extrabold text-brand">Lara&apos;s Pinnal</p>
        <p className="text-xs text-muted">Admin · {role}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {items.map((n) => {
          const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-control px-3 py-2 text-sm font-medium",
                active ? "bg-brand text-white" : "text-ink hover:bg-brand-tint",
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-hairline p-3">
        <p className="px-1 text-sm font-medium">{name}</p>
        <button onClick={logout} className="mt-1 px-1 text-sm text-warning hover:underline">
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-hairline bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-hairline bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-2xl">
          ☰
        </button>
        <span className="font-heading font-extrabold text-brand">Admin</span>
        <span className="w-6" />
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-white">{sidebar}</div>
        </div>
      )}

      <main className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
