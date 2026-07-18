"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMenu } from "@/components/ui/icons";
import { Drawer } from "@/components/ui/Drawer";
import type { CategoryLink } from "@/types";

// The ≡ menu on mobile: account entry + category list in a left drawer.
export function MobileMenu({ categories }: { categories: CategoryLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-brand-tint lg:hidden"
      >
        <IconMenu className="h-6 w-6" />
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Menu" side="left">
        <div className="p-4">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block rounded-control bg-brand px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            Sign in / Register
          </Link>

          <nav className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Shop by category</p>
            <div className="grid gap-1">
              <Link href="/shop" onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm hover:bg-brand-tint">
                All products
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded px-2 py-2 text-sm hover:bg-brand-tint"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </nav>

          <nav className="mt-5 border-t border-hairline pt-4">
            <div className="grid gap-1 text-sm">
              {[
                { label: "Your Account", href: "/account" },
                { label: "Your Orders", href: "/account/orders" },
                { label: "Track order", href: "/track" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded px-2 py-2 hover:bg-brand-tint"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </Drawer>
    </>
  );
}
