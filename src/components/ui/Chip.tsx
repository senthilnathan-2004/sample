"use client";

import { cn } from "@/lib/cn";

// Selectable chip (sort chips, active filters). Selected = magenta tint fill.
export function Chip({
  selected = false,
  onRemove,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  onRemove?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150",
        selected
          ? "border-brand bg-brand-tint text-brand"
          : "border-hairline bg-white text-ink hover:bg-brand-tint-strong",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <span
          role="button"
          aria-label="Remove filter"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 text-base leading-none"
        >
          ×
        </span>
      )}
    </button>
  );
}
