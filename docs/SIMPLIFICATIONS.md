# Lara's Pinnal — Simplified / Stubbed / Placeholder items

Everything intentionally simplified or left as a placeholder during the build, per
the spec's requirement to disclose them. Nothing here is a silent gap — each is
documented in-code near its site.

## Requires real credentials to fully exercise (code complete, not yet run against live services)
- **Razorpay** — order creation + a real captured-payment webhook. The signature
  verification (HMAC-SHA256, `payment.captured`) is proven with a locally-generated
  HMAC; a real end-to-end run needs `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` + a public
  webhook tunnel (ngrok/Vercel). COD path is fully verified and needs nothing.
- **ImageKit** — real image uploads. `ImageUploader` has a URL-paste fallback that
  works without keys (verified); signed-upload auth (`/api/imagekit/auth`) needs
  `IMAGEKIT_*`.
- **SMS (OTP)** — no provider wired to a specific SMS vendor; when `SMS_PROVIDER` is
  empty, OTP is logged to the server console (verified). When set, it routes through
  `lib/notify` — the actual vendor HTTP call is a TODO (currently the graceful
  fallback chain).
- **WhatsApp / Email** — `lib/notify` calls WhatsApp Cloud API + Resend when tokens
  are present; otherwise logs to console (verified). Not tested against live APIs.

## Product decisions deferred to the owner (flagged in the plan)
- **Pincode → city/state lookup** — `DeliveryEstimate` and checkout currently echo the
  pincode; city/state are manual fields. No lookup provider chosen yet.
- **Courier tracking deep-links** — tracking shows courier + number as text; no
  per-courier external tracking URL format wired.

## Intentional simplifications
- **CMS rich-text sanitizer** (`lib/sanitize.ts`) — conservative regex allowlist, not a
  vetted library (sanitize-html/DOMPurify). Applied on save AND render. Swap in a
  hardened lib for production.
- **Admin pages editor** — creating/overwriting a page works; "edit existing" re-enters
  the body (no load-existing-into-editor, no WYSIWYG). Rich-text editor is a plain
  HTML textarea.
- **CMS content editor** — covers branding, announcement, commerce, footer. The full
  banner-carousel drag-reorder builder + home-sections reordering are minimal (banners
  are seeded + consumed; add a builder UI later).
- **Rate limiting** (`lib/rateLimit.ts`) — in-memory fixed-window, per-instance. Use
  Upstash/Redis for multi-instance production.
- **Analytics** — GA4 + Meta Pixel are feature-flagged loaders + a `track()` helper;
  only `purchase`/`add_to_cart`/etc. call sites that were wired are fired. Extend event
  coverage as needed.
- **Cart server-sync on login** — cart/wishlist persist in localStorage across the
  session; server-side sync/merge on login is not implemented.
- **Email/phone change** in the account profile — shown read-only; changing them (with
  OTP/link re-verification) is not wired.
- **First-party analytics** compute in JS over all orders (fine at this scale); move to
  aggregation pipelines for large datasets.

## Verified working (in-memory MongoDB, per phase)
Storefront browse/filter/sort/search · PDP + variants + reviews · cart · **COD order +
coupon server-recompute + webhook HMAC (valid & forged)** · **register/login (email +
phone OTP) + ownership 403 + guest tracking** · **admin login + RBAC 403 + product CRUD +
order fulfillment tracking-gate + review approve→recompute + CMS edit** · notifications
(console fallback) · sitemap/robots/JSON-LD · home page.

## Bug found & fixed during verification
`middleware.ts` was at the project root but the project uses a `src/` directory, so Next
never ran it — leaving every `/admin/*` page reachable without login. Moved to
`src/middleware.ts`; guard confirmed (`/admin` → 307 `/admin/login`).
