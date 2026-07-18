"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecentItem } from "@/types";

// Recently-viewed products (most recent first, capped). Logged on PDP view.
type RecentState = {
  items: RecentItem[];
  add: (item: Omit<RecentItem, "at">) => void;
};

const MAX = 12;

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const at = typeof performance !== "undefined" ? Date.now() : 0;
          const deduped = state.items.filter((i) => i.slug !== item.slug);
          return { items: [{ ...item, at }, ...deduped].slice(0, MAX) };
        }),
    }),
    { name: "lp-recently-viewed" },
  ),
);
