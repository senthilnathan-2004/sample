import Link from "next/link";
import type { SettingsShape, CategoryLink } from "@/types";
import {
  IconInstagram,
  IconFacebook,
  IconTwitter,
  IconLinkedin,
  IconHeart,
} from "@/components/ui/icons";

// Cities Lara's Pinnal ships to (Zepto lists delivery cities in the footer).
const CITIES = [
  "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Bengaluru", "Hyderabad",
  "Mumbai", "Pune", "Delhi", "Gurugram", "Noida", "Kolkata", "Ahmedabad", "Jaipur",
  "Kochi", "Thiruvananthapuram", "Vijayawada", "Vizag", "Nagpur", "Indore", "Lucknow",
  "Chandigarh", "Bhopal", "Surat", "Vadodara", "Mysuru", "Mangaluru",
];

// Map a social label to an icon; falls back to a text link if unknown.
function socialIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("insta")) return IconInstagram;
  if (l.includes("face")) return IconFacebook;
  if (l.includes("twit") || l === "x") return IconTwitter;
  if (l.includes("linked")) return IconLinkedin;
  return null;
}

// Zepto-style footer: category cluster + shipping cities + link columns + brand.
export function Footer({
  settings,
  categories,
}: {
  settings: SettingsShape;
  categories: CategoryLink[];
}) {
  const { footer, branding } = settings;

  return (
    <footer className="mt-14 border-t border-hairline bg-cream">
      <div className="mx-auto max-w-page px-4 pt-10 pb-6 lg:px-6 lg:py-10">
        {/* Shop-by-category cluster */}
        <div>
          <h2 className="font-heading text-base font-extrabold text-ink">Shop Categories</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted text-justify">
            <Link href="/shop" className="hover:text-brand">All products</Link>
            {categories.map((c) => (
              <span key={c.slug}>
                {" "}<span aria-hidden className="text-hairline">|</span>{" "}
                <Link href={`/shop/${c.slug}`} className="hover:text-brand">{c.name}</Link>
              </span>
            ))}
          </p>
        </div>

        {/* Cities we ship to */}
        <div className="mt-8">
          <h2 className="font-heading text-base font-extrabold text-ink">We Ship Across India</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted text-justify">
            {CITIES.map((city, i) => (
              <span key={city}>
                {i > 0 && <>{" "}<span aria-hidden className="text-hairline">|</span>{" "}</>}
                {city}
              </span>
            ))}
          </p>
        </div>

        <hr className="my-8 border-hairline" />

        {/* Link columns + brand */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="font-heading text-xl font-extrabold text-brand">
              {branding.siteName}
            </Link>
            <p className="mt-1 text-sm text-muted">{branding.tagline}</p>
            <p className="mt-4 text-sm text-muted break-words">{footer.contactInfo}</p>
            {branding.social.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {branding.social.map((s) => {
                  const Icon = socialIcon(s.label);
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="grid h-10 w-10 place-items-center rounded-full border border-hairline bg-white text-muted transition-colors hover:border-brand hover:text-brand"
                    >
                      {Icon ? <Icon className="h-5 w-5" /> : <span className="text-xs font-semibold">{s.label[0]}</span>}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-ink">{col.title}</p>
              <ul className="mt-3 grid gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted hover:text-brand">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-hairline pt-6 text-center text-xs text-muted sm:flex-row sm:justify-between sm:text-left">
          <p>{footer.copyright}</p>
          <p className="flex items-center gap-1.5">
            Made with <IconHeart className="h-3.5 w-3.5 fill-brand text-brand" /> in Tamil Nadu, India
          </p>
        </div>
      </div>
    </footer>
  );
}
