// Rating breakdown bars (5★ → 1★) with the average.
export function RatingBreakdown({
  average,
  count,
  breakdown,
}: {
  average: number;
  count: number;
  breakdown: Record<string, number>;
}) {
  return (
    <div className="grid gap-6 rounded-2xl border border-hairline bg-white p-6 shadow-sm lg:grid-cols-2 lg:items-center">
      {/* Left side: Rating numbers and bars */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="text-center sm:text-left">
          <p className="font-heading text-5xl font-extrabold text-brand">{average.toFixed(1)}</p>
          <div className="mt-1 flex justify-center text-brand sm:justify-start">
             {"★".repeat(Math.round(average))}
             <span className="text-hairline">{"★".repeat(5 - Math.round(average))}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-muted">
            {count} {count === 1 ? "rating" : "ratings"}
          </p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = breakdown[String(star)] ?? 0;
            const pct = count ? Math.round((n / count) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-4 font-medium text-muted">{star}★</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
                  <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right font-medium text-muted">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Right side: Customer Insights Box */}
      <div className="hidden flex-col justify-center rounded-xl bg-ink/5 p-5 text-center lg:flex lg:text-left">
        <h3 className="font-heading text-lg font-bold text-ink">Customer Insights</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Our products are highly rated by the community! We take pride in delivering top-notch quality and handmade perfection. Read the genuine experiences below to see why our customers love shopping with us.
        </p>
      </div>
    </div>
  );
}
