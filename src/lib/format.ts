// INR formatting + lead-time / delivery date helpers (en-IN).

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Human delivery estimate from a lead time in days, e.g. "by Fri, 25 Jul". */
export function deliveryDateLabel(leadTimeDays: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + leadTimeDays);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
