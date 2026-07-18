"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import type { CategoryDTO } from "@/types";
import { IconChevronRight, IconChevronLeft } from "@/components/ui/icons";
import { AppIcon } from "@/components/ui/AppIcon";

/**
 * Zepto-style category rail: a horizontally scrolling row of rounded image
 * tiles with labels. Arrow buttons (desktop) nudge the scroll; the row scrolls
 * naturally by touch/trackpad. Falls back to an icon tile when no image.
 */
export function CategoryRail({ categories }: { categories: CategoryDTO[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!categories.length) return null;

  const nudge = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="relative mt-3 sm:mt-4">
      <div
        ref={scroller}
        className="no-scrollbar flex gap-3 overflow-x-auto pb-1 sm:gap-4"
      >
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="group flex w-[88px] shrink-0 flex-col items-center gap-2 text-center sm:w-[104px] lg:w-[120px]"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-hairline bg-cream transition-shadow duration-200 group-hover:shadow-card">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width:640px) 88px, 120px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="grid h-full place-items-center text-brand">
                  <AppIcon name={c.slug} className="h-9 w-9" />
                </span>
              )}
            </div>
            <span className="line-clamp-2 text-xs font-semibold leading-tight text-ink sm:text-[13px]">
              {c.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Desktop scroll arrows */}
      <button
        onClick={() => nudge(-1)}
        aria-label="Scroll categories left"
        className="absolute -left-3 top-[38px] hidden h-9 w-9 place-items-center rounded-full border border-hairline bg-white text-ink shadow-card hover:bg-brand-tint lg:grid"
      >
        <IconChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => nudge(1)}
        aria-label="Scroll categories right"
        className="absolute -right-3 top-[38px] hidden h-9 w-9 place-items-center rounded-full border border-hairline bg-white text-ink shadow-card hover:bg-brand-tint lg:grid"
      >
        <IconChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
}
