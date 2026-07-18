"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconSearch } from "@/components/ui/icons";

type Suggestion = { name: string; slug: string };

// Rotating placeholder terms (Zepto-style "Search for ...").
const ROTATE = ["keychains", "flower bouquets", "bag charms", "soft toys", "gift hampers", "custom name tags"];

/**
 * Zepto universal search: a single rounded pill with a leading search icon and a
 * rotating placeholder. Debounced autocomplete dropdown of product suggestions.
 * Enter (or picking a suggestion) → /search or the product page.
 */
export function SearchBar({ categories = [] as { name: string; slug: string }[] }) {
  void categories;
  const router = useRouter();
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [rotIdx, setRotIdx] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Rotate placeholder term while the box is empty.
  useEffect(() => {
    if (q) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setRotIdx((i) => (i + 1) % ROTATE.length), 2600);
    return () => clearInterval(t);
  }, [q]);

  // Debounced suggestion fetch.
  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?suggest=1&q=${encodeURIComponent(q.trim())}`);
        if (res.ok) {
          const data = (await res.json()) as { items: Suggestion[] };
          setSuggestions(data.items);
          setOpen(true);
        }
      } catch {
        /* ignore */
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    setOpen(false);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={submit}
        className="flex h-12 items-center gap-2 rounded-full border border-hairline bg-cream px-4 transition-colors focus-within:border-brand focus-within:bg-white"
      >
        <IconSearch className="h-5 w-5 shrink-0 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          placeholder={`Search for "${ROTATE[rotIdx]}"`}
          aria-label="Search products"
          aria-expanded={open}
          role="combobox"
          aria-controls="search-suggestions"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-card border border-hairline bg-white py-1 shadow-card"
        >
          {suggestions.map((s) => (
            <li key={s.slug} role="option" aria-selected="false">
              <button
                onClick={() => {
                  setOpen(false);
                  setQ("");
                  router.push(`/product/${s.slug}`);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink hover:bg-brand-tint"
              >
                <IconSearch className="h-4 w-4 text-muted" />
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
