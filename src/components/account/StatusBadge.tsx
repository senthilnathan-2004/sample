import { cn } from "@/lib/cn";
import { STATUS_LABEL } from "./StatusTimeline";

// Color-coded fulfillment status badge (matches admin colors in Phase 5).
const TONE: Record<string, string> = {
  placed: "bg-cream text-muted",
  in_progress: "bg-[color:var(--warning)]/10 text-warning",
  ready: "bg-[color:var(--info)]/10 text-info",
  shipped: "bg-brand-tint text-brand",
  delivered: "bg-[color:var(--success)]/10 text-success",
  cancelled: "bg-cream text-muted line-through",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", TONE[status] ?? TONE.placed)}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
