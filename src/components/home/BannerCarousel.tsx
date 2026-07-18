"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/cn";

export type Banner = {
  image: string;
  headline?: string;
  subtext?: string;
  ctaText?: string;
  ctaLink?: string;
};

/**
 * Hero banner carousel — autoplay (pauses on hover), dots, swipe, keyboard.
 * Respects prefers-reduced-motion (autoplay disabled).
 */
const PLACEHOLDER = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='middle' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-card bg-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/7] lg:aspect-[16/5]">
        {banners.map((b, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={b.image || PLACEHOLDER}
              alt={b.headline ?? "Banner"}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            {(b.headline || b.ctaText) && (
              <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-black/25 p-3 sm:px-20 sm:py-12 lg:px-28">
                {b.headline && (
                  <h2 className="max-w-md font-heading text-2xl font-extrabold text-white sm:max-w-xl sm:text-5xl lg:max-w-2xl lg:text-6xl">
                    {b.headline}
                  </h2>
                )}
                {b.subtext && <p className="max-w-md text-sm text-white/90 sm:max-w-xl sm:text-lg lg:max-w-2xl lg:text-xl">{b.subtext}</p>}
                {b.ctaText && b.ctaLink && (
                  <Link
                    href={b.ctaLink}
                    className="mt-2 w-fit rounded-control bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover sm:mt-4 sm:px-8 sm:py-3.5 sm:text-base lg:text-lg"
                  >
                    {b.ctaText}
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button onClick={() => go(index - 1)} aria-label="Previous" className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink hover:bg-white sm:grid">‹</button>
          <button onClick={() => go(index + 1)} aria-label="Next" className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink hover:bg-white sm:grid">›</button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn("h-2 w-2 rounded-full", i === index ? "bg-white" : "bg-white/50")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
