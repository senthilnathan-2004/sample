"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconGrid, IconCart, IconUser } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useCart, selectCount } from "@/store/cartStore";
import { useHasMounted } from "@/lib/useHasMounted";

/**
 * Flipkart-style fixed bottom tab bar (≤md only). Home · Categories · Cart · Account.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const mounted = useHasMounted();
  const cartCount = useCart(selectCount);

  const tabs = [
    { label: "Home", href: "/", Icon: IconHome },
    { label: "Categories", href: "/categories", Icon: IconGrid },
    { label: "Cart", href: "/cart", Icon: IconCart, badge: mounted ? cartCount : 0 },
    { label: "Account", href: "/account", Icon: IconUser },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hairline bg-white md:hidden"
    >
      {tabs.map(({ label, href, Icon, badge }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              active ? "text-brand" : "text-muted",
            )}
          >
            <span className="relative">
              <Icon className="h-6 w-6" />
              {badge ? (
                <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
