"use client";

import type { VariantDTO } from "@/types";
import { cn } from "@/lib/cn";

/**
 * Colour + size selector. Variants combine colour and (optional) size; picking a
 * colour selects its first variant, then size buttons narrow within that colour.
 * The resolved variant index is lifted to the parent so price/buy-box stay in sync.
 */
export function VariantPicker({
  variants,
  selectedIndex,
  onSelect,
}: {
  variants: VariantDTO[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const selected = variants[selectedIndex];
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  const hasSizes = variants.some((v) => v.size);
  const sizesForColor = variants
    .filter((v) => v.color === selected?.color && v.size)
    .map((v) => v.size!) as string[];

  const selectColor = (color: string) => {
    const idx = variants.findIndex((v) => v.color === color);
    if (idx >= 0) onSelect(idx);
  };
  const selectSize = (size: string) => {
    const idx = variants.findIndex((v) => v.color === selected?.color && v.size === size);
    if (idx >= 0) onSelect(idx);
  };

  return (
    <div className="grid gap-4">
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink">
          Colour: <span className="text-muted">{selected?.color}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => selectColor(color)}
              className={cn(
                "min-h-[40px] rounded-control border px-3 py-1.5 text-sm font-medium transition-colors",
                selected?.color === color
                  ? "border-brand bg-brand-tint text-brand"
                  : "border-hairline bg-white text-ink hover:bg-brand-tint",
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {hasSizes && sizesForColor.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">
            Size: <span className="text-muted">{selected?.size}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((size) => (
              <button
                key={size}
                onClick={() => selectSize(size)}
                className={cn(
                  "min-h-[40px] min-w-[48px] rounded-control border px-3 py-1.5 text-sm font-medium transition-colors",
                  selected?.size === size
                    ? "border-brand bg-brand-tint text-brand"
                    : "border-hairline bg-white text-ink hover:bg-brand-tint",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
