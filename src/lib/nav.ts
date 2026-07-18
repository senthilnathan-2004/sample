import type { CategoryLink } from "@/types";

/**
 * Fallback category list for the layout shell. Phase 2 replaces this with the
 * DB Category model (fetched once in the root layout and passed to Header/CategoryStrip).
 * Emojis stand in for CMS-managed category icons until then.
 */
export const DEFAULT_CATEGORIES: CategoryLink[] = [
  { name: "Keychains", slug: "keychains", icon: "🔑" },
  { name: "Flower Bouquets", slug: "bouquets", icon: "💐" },
  { name: "Bag Charms", slug: "bag-charms", icon: "🎀" },
  { name: "Soft Toys", slug: "soft-toys", icon: "🧸" },
  { name: "Accessories", slug: "accessories", icon: "🧶" },
];
