"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CategoryLink } from "@/types";
import { cn } from "@/lib/cn";
import { AppIcon } from "@/components/ui/AppIcon";

/**
 * Zepto-style horizontal category tab strip under the header. Clean text+icon
 * tabs with a magenta active underline. Scrolls horizontally on smaller widths
 * (no visible scrollbar).
 */
export function CategoryStrip({ categories }: { categories: CategoryLink[] }) {
  const pathname = usePathname();

  const items = [
    { name: "All", slug: "all", href: "/shop", icon: "🛍️" },
    ...categories.map((c) => ({ name: c.name, slug: c.slug, href: `/shop/${c.slug}`, icon: c.icon })),
  ];

  return (
    <nav aria-label="Categories" className="hidden border-b border-hairline bg-white md:block">
      <div className="no-scrollbar mx-auto flex max-w-page items-center gap-1 overflow-x-auto px-4 lg:px-6">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-brand text-brand"
                  : "border-transparent text-ink hover:text-brand",
              )}
            >
              <span
                className={cn("text-base", active ? "text-brand" : "text-muted")}
                aria-hidden
              >
                <AppIcon name={item.slug || item.icon} className="h-[18px] w-[18px]" />
              </span>
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
