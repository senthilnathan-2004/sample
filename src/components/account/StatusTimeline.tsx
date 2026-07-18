import { cn } from "@/lib/cn";

const STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "in_progress", label: "Being made" },
  { key: "ready", label: "Ready to ship" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

type HistoryItem = { status: string; at: string | Date; note?: string };

function fmt(at: string | Date) {
  return new Date(at).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Vertical progress timeline (placed → delivered), reused by account + guest track.
export function StatusTimeline({
  status,
  history = [],
  courierName,
  trackingNumber,
}: {
  status: string;
  history?: HistoryItem[];
  courierName?: string;
  trackingNumber?: string;
}) {
  if (status === "cancelled") {
    return (
      <div className="rounded-control border border-hairline bg-cream p-4 text-sm">
        <span className="font-medium text-muted">This order was cancelled.</span>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const timeFor = (key: string) => history.find((h) => h.status === key)?.at;

  return (
    <ol className="relative ml-2">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        const at = timeFor(step.key);
        return (
          <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "absolute left-[7px] top-4 h-full w-0.5",
                  done ? "bg-brand" : "bg-hairline",
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2",
                done ? "border-brand bg-brand" : "border-hairline bg-white",
                active && "ring-4 ring-brand-tint",
              )}
              aria-hidden
            />
            <div className="min-w-0">
              <p className={cn("text-sm font-medium", done ? "text-ink" : "text-muted")}>
                {step.label}
              </p>
              {at && <p className="text-xs text-muted">{fmt(at)}</p>}
              {step.key === "shipped" && done && (courierName || trackingNumber) && (
                <p className="mt-0.5 text-xs text-muted">
                  {courierName}
                  {trackingNumber && (
                    <>
                      {" · "}
                      <span className="font-accent">{trackingNumber}</span>
                    </>
                  )}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export const STATUS_LABEL: Record<string, string> = {
  placed: "Placed",
  in_progress: "Being made",
  ready: "Ready to ship",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
