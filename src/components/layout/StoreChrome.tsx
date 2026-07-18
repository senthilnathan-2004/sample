"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * Renders storefront chrome (header, category strip, footer, mobile tab bar)
 * around store pages, but NOT on /admin/* — admin has its own shell. Chrome
 * nodes are pre-rendered on the server and passed in as props.
 */
export function StoreChrome({
  announcement,
  header,
  strip,
  footer,
  tabBar,
  children,
}: {
  announcement: React.ReactNode;
  header: React.ReactNode;
  strip: React.ReactNode;
  footer: React.ReactNode;
  tabBar: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      {announcement}
      <div className="sticky top-0 z-40 flex flex-col w-full">
        {header}
        {strip}
      </div>
      <main id="main-content" className="min-h-[60vh]">
        {children}
      </main>
      <div className={cn(pathname !== "/" && "hidden md:block")}>
        {footer}
      </div>
      {/* Universal spacer to prevent content/footer from hiding behind mobile tab bar */}
      <div className={cn("w-full md:hidden", pathname.startsWith("/product/") ? "h-4" : "h-20", pathname === "/" ? "bg-cream" : "bg-white")} aria-hidden="true" />
      {tabBar}
    </>
  );
}
