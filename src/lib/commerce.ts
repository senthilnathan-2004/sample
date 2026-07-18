/**
 * Display-side shipping rules (mirror the Settings defaults). These are for
 * client-side PREVIEW only — the authoritative shipping/discount/total is always
 * recomputed server-side in lib/pricing.ts at order time.
 */
export const SHIPPING = {
  flatRate: 49,
  freeThreshold: 999,
};

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.flatRate;
}
