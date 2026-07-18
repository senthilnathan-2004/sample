import type { SettingsShape } from "@/types";

/**
 * Default settings used until an admin saves the CMS singleton (Phase 5),
 * and as a resilient fallback if the DB is unreachable during storefront
 * development (so the shell renders without MONGODB_URI configured).
 */
export const DEFAULT_SETTINGS: SettingsShape = {
  branding: {
    siteName: "Lara's Pinnal",
    tagline: "The Crochet Corner",
    social: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "WhatsApp", href: "https://wa.me/" },
    ],
  },
  commerce: {
    currency: "INR",
    shippingFlatRate: 49,
    freeShippingThreshold: 999,
    defaultLeadTime: 4,
    codEnabled: true,
  },
  announcementBar: {
    text: "Handmade to order across India · Free shipping over ₹999",
    active: false,
  },
  footer: {
    columns: [
      {
        title: "Shop",
        links: [
          { label: "All products", href: "/shop" },
          { label: "Keychains", href: "/shop/keychains" },
          { label: "Bouquets", href: "/shop/bouquets" },
          { label: "Soft toys", href: "/shop/soft-toys" },
        ],
      },
      {
        title: "Help",
        links: [
          { label: "Track order", href: "/track" },
          { label: "Shipping", href: "/policies/shipping" },
          { label: "Returns & refunds", href: "/policies/refund" },
          { label: "FAQ", href: "/policies/faq" },
        ],
      },
      {
        title: "About",
        links: [
          { label: "Our story", href: "/policies/about" },
          { label: "Contact", href: "/policies/contact" },
          { label: "Privacy", href: "/policies/privacy" },
        ],
      },
    ],
    contactInfo: "Tamil Nadu, India · hello@laraspinnal.in",
    copyright: `© ${new Date().getFullYear()} Lara's Pinnal — The Crochet Corner`,
  },
  seoDefaults: {
    title: "Lara's Pinnal — The Crochet Corner",
    description: "Handmade crochet keychains, bouquets, bag charms and soft toys, made to order in Tamil Nadu.",
  },
};

/**
 * Reads the CMS settings singleton, falling back to defaults. Cached per request
 * via React's dedupe; revalidated by admin saves in Phase 5. Dynamic import of the
 * model keeps Mongoose out of the client bundle.
 */
export async function getSettings(): Promise<SettingsShape> {
  try {
    const { dbConnect } = await import("./db");
    const { Settings } = await import("@/models/Settings");
    await dbConnect();
    const doc = await Settings.findOne({ key: "singleton" }).lean<SettingsShape>().exec();
    return doc ? { ...DEFAULT_SETTINGS, ...doc } : DEFAULT_SETTINGS;
  } catch {
    // DB not configured/unreachable — render the shell with defaults.
    return DEFAULT_SETTINGS;
  }
}
