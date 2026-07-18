// Minimal className joiner (no clsx dependency needed for our usage).
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
