"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

// PDP gallery: main image + thumbnail strip. Mobile tap on the main image zooms.
export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const list = images.length ? images : [];

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-card border border-hairline bg-cream",
          zoom && "cursor-zoom-out",
        )}
        onClick={() => setZoom((z) => !z)}
      >
        {list[active] ? (
          <Image
            src={list[active]}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 440px"
            className={cn(
              "object-cover transition-transform duration-200",
              zoom ? "scale-150" : "scale-100",
            )}
          />
        ) : (
          <div className="grid h-full place-items-center text-6xl">🧶</div>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-md border-2",
                i === active ? "border-brand" : "border-hairline",
              )}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
