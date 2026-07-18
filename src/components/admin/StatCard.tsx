export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-hairline bg-white p-4 shadow-card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-heading text-2xl font-extrabold text-ink">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
