import Link from "next/link";
import type { Branding, CategoryLink } from "@/types";
import { IconSearch } from "@/components/ui/icons";
import { DeliverToBadge } from "./DeliverToBadge";
import { SearchBar } from "./SearchBar";
import { AccountFlyout } from "./AccountFlyout";
import { CartButton } from "./CartButton";
import { MobileMenu } from "./MobileMenu";

/**
 * Zepto-style top nav (white skin), sticky. Row layout:
 *   [≡ mobile] [LOGO] [Deliver to ▾] [———— pill search ————] [Login ▾] [🛒 Cart]
 * On mobile collapses to [≡][LOGO][search icon][cart]; deliver-to/login move to
 * the drawer. Search terms rotate in the placeholder like Zepto.
 */
export function Header({
  branding,
  categories,
}: {
  branding: Branding;
  categories: CategoryLink[];
}) {
  return (
    <header className="border-b border-hairline bg-white">
      <div className="mx-auto flex h-16 max-w-page flex-nowrap items-center gap-x-3 px-3 sm:gap-x-5 sm:px-4 lg:h-[72px] lg:gap-6 lg:px-6">
        {/* Left: menu (mobile) + logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <MobileMenu categories={categories} />
          <Link href="/" className="flex shrink-0 flex-col leading-none" aria-label={branding.siteName}>
            <span className="font-heading text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
              {branding.siteName}
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted sm:block">
              {branding.tagline}
            </span>
          </Link>
        </div>

        {/* Deliver-to (desktop) */}
        <div className="hidden lg:block">
          <DeliverToBadge />
        </div>

        {/* Pill search (desktop) */}
        <div className="hidden flex-1 items-center lg:flex">
          <SearchBar categories={categories} />
        </div>

        {/* Right: mobile search icon, login/account, cart */}
        <div className="ml-auto flex items-center gap-1 sm:gap-3 lg:ml-0 lg:gap-5">
          <Link
            href="/search"
            aria-label="Search"
            className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-brand-tint lg:hidden"
          >
            <IconSearch className="h-6 w-6" />
          </Link>

          <div className="hidden sm:block">
            <AccountFlyout />
          </div>

          <CartButton />
        </div>
      </div>
    </header>
  );
}
