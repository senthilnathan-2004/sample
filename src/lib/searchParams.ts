// Convert Next.js server-component searchParams object into URLSearchParams.
export function toURLSearchParams(
  sp: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v == null) continue;
    out.set(k, Array.isArray(v) ? v[0] : v);
  }
  return out;
}
