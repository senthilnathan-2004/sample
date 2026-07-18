import { cn } from "@/lib/cn";

// Calm skeleton (pulse only; reduced-motion disables it via global CSS).
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-cream", className)} aria-hidden="true" />;
}
