"use client";

// Fire an analytics event to GA4 (gtag) and Meta Pixel (fbq) if present.
// No-op when neither is configured, so calls are always safe.
type Params = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const GA_TO_META: Record<string, string> = {
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  sign_up: "CompleteRegistration",
  login: "Login",
};

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  const metaEvent = GA_TO_META[event];
  if (metaEvent) window.fbq?.("track", metaEvent, params);
}
