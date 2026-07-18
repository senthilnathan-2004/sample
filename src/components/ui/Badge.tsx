import { cn } from "@/lib/cn";

type Tone = "brand" | "neutral" | "success" | "warning" | "info" | "muted";

const tones: Record<Tone, string> = {
  brand: "bg-brand-tint text-brand",
  neutral: "bg-cream text-ink border border-hairline",
  success: "bg-[color:var(--success)]/10 text-success",
  warning: "bg-[color:var(--warning)]/10 text-warning",
  info: "bg-[color:var(--info)]/10 text-info",
  muted: "bg-cream text-muted",
};

export function Badge({
  tone = "brand",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
