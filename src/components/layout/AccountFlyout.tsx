"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { IconUser, IconChevronDown } from "@/components/ui/icons";

// Zepto-style account control on the white bar — "Login" when signed out,
// "Hi, <name>" when signed in, with a hover/click flyout menu.
export function AccountFlyout() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: session, status } = useSession();
  const user = session?.user;

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative hidden md:block" onMouseEnter={show} onMouseLeave={hide}>
      <button
        className="flex h-11 items-center gap-1.5 rounded-full px-2 text-ink hover:bg-brand-tint sm:px-3"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <IconUser className="h-6 w-6" />
        <span className="hidden items-center gap-0.5 text-sm font-medium lg:flex">
          {user ? `Hi, ${user.name?.split(" ")[0] ?? "there"}` : "Login"}
          <IconChevronDown className="h-3.5 w-3.5 text-muted" />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-60 rounded-card border border-hairline bg-white p-3 shadow-card"
        >
          {status !== "authenticated" ? (
            <div className="flex flex-col gap-2 border-b border-hairline pb-3">
              <Link href="/login" className="w-full">
                <span className="block rounded-control bg-brand px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-hover">
                  Sign in
                </span>
              </Link>
              <p className="text-center text-xs text-muted">
                New customer?{" "}
                <Link href="/login?mode=register" className="text-brand underline">
                  Register
                </Link>
              </p>
            </div>
          ) : (
            <div className="border-b border-hairline pb-2 text-sm font-medium">{user?.name}</div>
          )}

          <nav className="grid gap-1 pt-2 text-sm">
            {[
              { label: "Your Account", href: "/account" },
              { label: "Your Orders", href: "/account/orders" },
              { label: "Wishlist", href: "/wishlist" },
              { label: "Buy Again", href: "/account/buy-again" },
              { label: "Track order", href: "/track" },
            ].map((l) => (
              <Link key={l.href} href={l.href} role="menuitem" className="rounded px-2 py-1.5 hover:bg-brand-tint">
                {l.label}
              </Link>
            ))}
            {status === "authenticated" && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded px-2 py-1.5 text-left text-warning hover:bg-brand-tint"
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
