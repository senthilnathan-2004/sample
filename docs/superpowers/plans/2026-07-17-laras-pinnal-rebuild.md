# Lara's Pinnal — Amazon/Flipkart Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality handmade-crochet e-commerce site (storefront + full user accounts + checkout/payments + admin/CMS) using Amazon + Flipkart layout/workflow patterns, skinned in a single magenta brand.

**Architecture:** Next.js 14 App Router (RSC + client islands). Storefront/product/policy pages use ISR (`revalidate: 60`); account pages are dynamic per-user; admin is guarded by `middleware.ts` + server-side RBAC. Data in MongoDB Atlas via Mongoose. Payments via Razorpay (server-created order + signature-verified webhook — never trust the client). Media via ImageKit signed uploads. Auth via NextAuth (separate user and admin flows). Cart/wishlist/recently-viewed in Zustand (persisted, server-synced when logged in).

**Tech Stack:** Next.js 14 (TS, App Router), Tailwind CSS, Framer Motion, MongoDB Atlas + Mongoose, ImageKit, Razorpay, NextAuth.js, Zustand, Recharts, zod, bcrypt.

## Global Constraints

- Node 20; Next.js 14 App Router + TypeScript throughout.
- **Single brand color `#D2388D`. NO gradients. No Amazon/Flipkart brand hues.** `--success/--warning/--info` are status semantics only, never decorative. Tokens exactly per spec §B7.
- Fonts via `next/font/google` only (no CDN): Baloo 2 700/800 (`font-heading`), Poppins 400/500/600 (`font-body`), Cutive Mono 400 (`font-accent`).
- Made-to-order: show `leadTimeDays` / delivery estimate — never a fake "in stock" badge. `variant.stock: null` = made-to-order.
- **No secrets in the browser.** Only `NEXT_PUBLIC_*` may reach client. `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `IMAGEKIT_PRIVATE_KEY`, `NEXTAUTH_SECRET`, `MONGODB_URI`, SMS keys stay server-side.
- **No user or admin password/hash/OTP in `.env`** — all live in DB (bcrypt; OTP hashed with TTL). Admin owner bootstrapped once via `seed-admin.ts` reading `SEED_OWNER_*`.
- Payment trust boundary: order marked `paid` ONLY by signature-verified webhook (`crypto` HMAC-SHA256, `payment.captured`). Client callback never sets paid.
- Order total + coupon discount recomputed server-side; never trust client prices.
- Account APIs enforce `userId` ownership on every read/write. Guest tracking requires order number **and** matching phone.
- All API routes: zod validation + rate-limit on `/api/auth/*`, `/api/otp/*`, `/api/orders`, `/api/razorpay/*`, `/api/custom-orders`, `/api/reviews`, `/api/account/*`. CMS rich-text sanitized against XSS.
- Mobile-first: no horizontal scroll 320px → 4K. Verify at 320/375/768/1024/1440. Min touch target 44×44. Visible 2px magenta focus ring on every interactive element. Honor `prefers-reduced-motion`.
- `.env.local` git-ignored; only blank `.env.example` committed. Security headers (CSP, X-Frame-Options, HSTS in prod, Referrer-Policy) via `next.config`.
- Card radius 12–16px; control radius 10px; shadow `0 2px 12px rgba(48,24,18,0.06)`; hairlines only where Amazon/Flipkart use them.

**Data models** are defined in spec Part B §B5 and are the source of truth for all field lists referenced below.

**Credential dependency:** Phases 0–2 need only `MONGODB_URI`. Phase 3 needs Razorpay test keys + webhook tunnel (e.g. ngrok/Vercel). Phase 4 OTP verifies via dev console fallback (real SMS optional). ImageKit needed to test real uploads (Phase 2/5).

---

## Phase 0 — Foundation

Boots a bare Next.js app with the brand system, DB connection, and security scaffolding.

### Task 0.1: Scaffold Next.js 14 + Tailwind + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.gitignore`, `.env.example`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Interfaces:**
- Produces: a runnable dev server; Tailwind tokens `brand`/`brand-hover`/`brand-tint`/`brand-tint-strong`/`ink`/`muted`/`cream`/`hairline`/`info`, fonts `font-heading`/`font-body`/`font-accent`, `shadow-card`, radius `card`/`control`.

- [ ] **Step 1:** `npx create-next-app@14 . --ts --tailwind --app --src-dir --no-eslint --import-alias "@/*"` (into the existing folder).
- [ ] **Step 2:** Add brand tokens to `globals.css` `:root` exactly per §B7 (magenta system, no gradients). Map them into `tailwind.config.ts` theme extend (colors, fontFamily, boxShadow, borderRadius).
- [ ] **Step 3:** Wire `next/font/google` for Baloo 2 / Poppins / Cutive Mono in `layout.tsx`; expose as CSS variables consumed by the Tailwind font tokens.
- [ ] **Step 4:** Add `.gitignore` entry for `.env.local`; create blank `.env.example` with all keys from spec §10.
- [ ] **Step 5:** Add security headers in `next.config.js` `headers()` (CSP, X-Frame-Options=DENY, Referrer-Policy=strict-origin-when-cross-origin, HSTS behind `NODE_ENV==='production'`), and ImageKit remote image domain.
- [ ] **Verify:** `npm run dev` boots with no console errors; a temporary swatch of `bg-brand`/`text-ink` renders magenta+dark; `curl -I localhost:3000` shows security headers; fonts load (Network shows self-hosted, no fonts.googleapis.com).

### Task 0.2: DB connection + typed env

**Files:**
- Create: `src/lib/db.ts`, `src/lib/env.ts`, `src/types/index.ts`

**Interfaces:**
- Produces: `dbConnect(): Promise<typeof mongoose>` (cached global connection, avoids hot-reload re-connect); `env` object with server-side validated vars.

- [ ] **Step 1:** Install `mongoose zod`. Write `lib/env.ts` that zod-parses `process.env` server-side (fail fast on missing required keys; `NEXT_PUBLIC_*` allowed on client).
- [ ] **Step 2:** Write `lib/db.ts` with the standard Next.js global-cached Mongoose singleton.
- [ ] **Step 3:** Add a temporary `src/app/api/_health/route.ts` that calls `dbConnect()` and returns `{ ok: true }`.
- [ ] **Verify:** With `MONGODB_URI` set in `.env.local`, `GET /api/_health` returns `{ok:true}`; with it unset, `lib/env` throws a clear error. Delete `_health` route after verifying.

### Task 0.3: Middleware skeleton + shared UI primitives

**Files:**
- Create: `middleware.ts`, `src/components/ui/{Button,Badge,Chip,Input,Select,Skeleton,Drawer,BottomSheet,ConfirmDialog}.tsx`

**Interfaces:**
- Produces: `middleware.ts` matcher over `/admin/:path*` and `/account/:path*` (redirect logic stubbed to `next()` until auth exists in Phase 4/5, with a TODO marker); UI primitives with magenta focus rings + 44px targets.

- [ ] **Step 1:** Write `middleware.ts` with a `config.matcher` for `/admin/:path*` and `/account/:path*`; return `NextResponse.next()` for now (real guards added in Phases 4/5).
- [ ] **Step 2:** Build the `ui/` primitives (Button with primary/secondary variants per §2, Badge, Chip, Input, Select with visible focus ring, Skeleton, Drawer, BottomSheet, ConfirmDialog). Install `framer-motion`.
- [ ] **Verify:** Render each primitive on a scratch page; Tab-focus shows 2px magenta ring; buttons meet 44px; reduced-motion disables transitions.

---

## Phase 1 — Layout shell (Amazon nav + Flipkart strip + mobile tab bar)

Global chrome reading from a CMS `Settings` singleton.

### Task 1.1: Settings model + getSettings reader

**Files:**
- Create: `src/models/Settings.ts`, `src/lib/settings.ts`

**Interfaces:**
- Produces: `Settings` model (singleton per §B4: branding, commerce, announcementBar, homeSections[], footer, seoDefaults); `getSettings(): Promise<SettingsDoc>` (cached, revalidated, returns sane defaults if none exists).

- [ ] **Step 1:** Define `Settings` schema per §B4 field list.
- [ ] **Step 2:** Write `getSettings()` with `unstable_cache`/`revalidate` and default fallback so the shell renders before seeding.
- [ ] **Verify:** Call `getSettings()` from a server component; returns defaults with no DB row present.

### Task 1.2: Header (Amazon top nav) + AnnouncementBar

**Files:**
- Create: `src/components/layout/{Header,DeliverToBadge,SearchBar,AccountFlyout,CartButton,AnnouncementBar}.tsx`
- Modify: `src/app/layout.tsx` (mount them)

**Interfaces:**
- Consumes: `getSettings()`, cart store count (Phase 3 — use a `0` placeholder selector now, wired later).
- Produces: sticky `Header` compressing on scroll; `SearchBar` with scope dropdown → routes to `/search?q=`; `AccountFlyout` showing "Sign in" (session wiring in Phase 4); `CartButton` opening a drawer (drawer content in Phase 3).

- [ ] **Step 1:** Build `Header` row layout per §B2.1 (menu, logo, DeliverToBadge, SearchBar, AccountFlyout, Wishlist, CartButton); sticky + scroll-compress.
- [ ] **Step 2:** `SearchBar` submits to `/search?q=`; autocomplete dropdown stubbed (real suggestions in Phase 2). `DeliverToBadge` shows "Select location" placeholder.
- [ ] **Step 3:** `AnnouncementBar` renders from `settings.announcementBar` when active.
- [ ] **Verify:** Header renders 320px→desktop; mobile collapses to `[≡][LOGO][🔎][🛒]`, search expands on focus; no horizontal scroll; keyboard-navigable.

### Task 1.3: CategoryStrip + MobileTabBar + Footer

**Files:**
- Create: `src/components/layout/{CategoryStrip,MobileTabBar,Footer}.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `getSettings()` (footer), categories list (Phase 2 — accept a prop, feed `[]` for now).
- Produces: horizontally-scrollable `CategoryStrip`; fixed `MobileTabBar` (Home·Categories·Cart·Account, ≤md, active magenta, cart badge); CMS-driven `Footer`.

- [ ] **Step 1:** Build `CategoryStrip` (overflow-x-auto, no scrollbar, active = `--brand`).
- [ ] **Step 2:** Build `MobileTabBar` fixed bottom, hidden ≥md, 44px targets.
- [ ] **Step 3:** Build `Footer` from `settings.footer` columns + contact + copyright.
- [ ] **Verify:** Strip scrolls horizontally on mobile without page scroll; tab bar visible only ≤md with active state; footer renders from settings defaults.

---

## Phase 2 — Catalog (models, seed, shop, PDP, search)

### Task 2.1: Category + Product models

**Files:**
- Create: `src/models/Category.ts`, `src/models/Product.ts`

**Interfaces:**
- Produces: `Category` and `Product` Mongoose models with exact §B5 fields (Product: variants[], `basePrice`, `compareAtPrice?`, `leadTimeDays`, `ratingAvg`, `ratingCount`, slug unique, `isActive`, `isBestseller`, seo{}).

- [ ] **Step 1:** Define `Category` schema (slug unique, sortOrder, isActive, seo).
- [ ] **Step 2:** Define `Product` schema with the `variants` subdoc (`stock: number|null`) and text index on name/tags for search.
- [ ] **Verify:** `npx tsc --noEmit` passes; a scratch script can `create` and `find` one product.

### Task 2.2: Seed script (products, categories, banners)

**Files:**
- Create: `scripts/seed.ts`

**Interfaces:**
- Consumes: Category/Product/Banner/Settings models.
- Produces: `npm run seed` — 8–10 products across categories (keychains, bouquets, bag charms, soft toys, accessories), categories, banners, default Settings. (Reviews + sample customers/orders added in Phases 4.)

- [ ] **Step 1:** Add `"seed": "tsx scripts/seed.ts"` to package.json; install `tsx`.
- [ ] **Step 2:** Write idempotent upserts for categories, 8–10 products (with `leadTimeDays`, some `compareAtPrice` for discount %, variants incl. made-to-order `stock:null`), banners, and the Settings singleton.
- [ ] **Verify:** `npm run seed` populates DB; re-running doesn't duplicate; `Product.find({isActive:true})` returns ≥8.

### Task 2.3: Product API + ProductCard + RatingPill

**Files:**
- Create: `src/app/api/products/route.ts`, `src/app/api/products/[slug]/route.ts`, `src/app/api/categories/route.ts`, `src/components/product/{ProductCard,RatingPill,ProductGrid,ProductListRow}.tsx`

**Interfaces:**
- Produces: `GET /api/products?category&minPrice&maxPrice&color&rating&sort&page` → `{ items, total, facetCounts }`; `GET /api/products/[slug]`; `GET /api/categories`. `ProductCard({product})` — standard Flipkart/Amazon card per §B2.4 (no flip; discount badge, RatingPill, price/MRP/discount%, lead-time chip, hover add-to-cart). `facetCounts` shape: `{ categories:{slug:count}, colors:{name:count}, ratings:{4:count,3:count} }`.

- [ ] **Step 1:** Implement `GET /api/products` with zod-validated query params, Mongoose filtering/sorting/pagination, and aggregation for `facetCounts` (live filter counts).
- [ ] **Step 2:** Build `RatingPill` (`--brand-tint`/`--brand` chip `4.5 ★`), `ProductCard`, `ProductGrid`, `ProductListRow` (whole card links to PDP; add-to-cart/heart `stopPropagation`; locked aspect-ratio ImageKit lazy image).
- [ ] **Verify:** `GET /api/products` returns seeded items + correct facet counts; ProductCard renders on a scratch page at 2-col (≤375) and 4-col (desktop), no CLS.

### Task 2.4: Shop page (filter rail + sort + grid, mobile bottom-sheet)

**Files:**
- Create: `src/app/shop/page.tsx`, `src/app/shop/[category]/page.tsx`, `src/components/product/FilterRail.tsx`, `src/components/product/SortBar.tsx`
- Modify: `CategoryStrip` (feed real categories)

**Interfaces:**
- Consumes: `/api/products`, `/api/categories`.
- Produces: Amazon left filter rail (desktop) with live counts / Flipkart bottom-sheet (mobile) + sort chips; grid with infinite scroll, skeletons, empty state w/ clear-filters; list-view toggle.

- [ ] **Step 1:** Build `FilterRail` (category, price range, color swatches, rating, availability/lead-time) reading `facetCounts`; selected filters → removable chips + "Clear all" above grid.
- [ ] **Step 2:** `SortBar` (popularity, price ↑/↓, newest, rating, discount) + grid/list toggle; wire infinite scroll + skeletons + empty state.
- [ ] **Step 3:** Mobile: filters in `BottomSheet`, sort as inline chips.
- [ ] **Verify:** Filtering by category/price/color updates grid + counts; sort reorders; mobile bottom-sheet opens; no horizontal scroll 320px→desktop.

### Task 2.5: PDP buy-box + gallery + variant picker + delivery estimate

**Files:**
- Create: `src/app/product/[slug]/page.tsx`, `src/components/product/{ImageGallery,VariantPicker,BuyBox,DeliveryEstimate,RelatedProducts}.tsx`

**Interfaces:**
- Consumes: `/api/products/[slug]`, `/api/products` (related), cart store (Phase 3 — stub `addToCart` now, wire later).
- Produces: Amazon 3-column buy-box per §B2.6; `VariantPicker` (color chips/size buttons, live price via `priceDelta`, custom-text input); `DeliveryEstimate` ("Handmade — ships in X days; deliver to <pincode> by <date>"); sticky mobile bottom CTA; Product + BreadcrumbList JSON-LD; `generateMetadata`; ISR 60.

- [ ] **Step 1:** Build `ImageGallery` (main + thumbs, mobile tap-to-zoom), `VariantPicker` (live price), `BuyBox` (price, qty stepper, Add to Cart, Buy Now, wishlist, secure-payment note).
- [ ] **Step 2:** Add `DeliveryEstimate` (compute ready-by from slowest variant `leadTimeDays`), description/care tabs, `RelatedProducts` rail, sticky mobile CTA.
- [ ] **Step 3:** Add `generateMetadata`, Product + BreadcrumbList JSON-LD, `export const revalidate = 60`.
- [ ] **Verify:** PDP renders for a seeded slug; variant change updates price + delivery estimate; JSON-LD validates; sticky CTA appears only on mobile; no console errors.

### Task 2.6: Search page + header autocomplete

**Files:**
- Create: `src/app/search/page.tsx`, `src/app/api/products/route.ts` (extend with `q`)
- Modify: `SearchBar` (real autocomplete)

**Interfaces:**
- Consumes: `/api/products?q=`.
- Produces: `/search?q=` with query echo, result count, same FilterRail + grid; header autocomplete of product + category suggestions.

- [ ] **Step 1:** Extend `/api/products` with text search on `q`; add a lightweight `?q=&suggest=1` mode for autocomplete.
- [ ] **Step 2:** Build `/search` reusing FilterRail + ProductGrid; wire `SearchBar` autocomplete dropdown.
- [ ] **Verify:** Typing in header shows suggestions; Enter → `/search?q=` shows matching seeded products with count.

---

## Phase 3 — Cart, checkout, payments

### Task 3.1: Cart / wishlist / recently-viewed stores

**Files:**
- Create: `src/store/{cartStore,wishlistStore,recentlyViewedStore}.ts`
- Modify: `CartButton`, `MobileTabBar`, `ProductCard`, `BuyBox` (wire real add-to-cart/count)

**Interfaces:**
- Produces: Zustand stores persisted to localStorage; `cartStore` exposes `items`, `add(product,variant,qty)`, `remove`, `setQty`, `count`, `subtotal`. Server-sync hook for logged-in users added in Phase 4.

- [ ] **Step 1:** Build the three Zustand stores with `persist` middleware.
- [ ] **Step 2:** Wire real cart count into Header/MobileTabBar; wire ProductCard/BuyBox add-to-cart; log views into recentlyViewed.
- [ ] **Verify:** Adding items updates header badge; refresh persists cart; recently-viewed rail populates.

### Task 3.2: Cart drawer + cart page + price details

**Files:**
- Create: `src/components/cart/{CartDrawer,CartItem,PriceDetails}.tsx`, `src/app/cart/page.tsx`
- Modify: `CartButton` (open drawer)

**Interfaces:**
- Consumes: `cartStore`, `/api/coupons/validate` (preview only; authoritative recompute at order time).
- Produces: slide-in drawer (right desktop / full-screen mobile) + `/cart` page: line items (thumb, variant, qty stepper, remove, move-to-wishlist), `PriceDetails` (subtotal/discount/shipping/total), coupon preview, Checkout CTA, empty state.

- [ ] **Step 1:** Build `CartDrawer` + `CartItem` + `PriceDetails`.
- [ ] **Step 2:** Build `/cart` page reusing them; add coupon preview input.
- [ ] **Verify:** Drawer opens from anywhere; qty/remove update totals; empty state shows; move-to-wishlist works.

### Task 3.3: Coupon + Order models + coupon validate API

**Files:**
- Create: `src/models/{Order,Coupon}.ts`, `src/app/api/coupons/validate/route.ts`, `src/lib/pricing.ts`

**Interfaces:**
- Produces: `Order` + `Coupon` models per §B5; `computeOrderTotals(items, couponCode): {subtotal, discount, shipping, total}` in `lib/pricing.ts` (server-authoritative); `POST /api/coupons/validate` → `{valid, discount, message}`.

- [ ] **Step 1:** Define `Order` (orderNumber `LP-2026-0007`, statusHistory[], fulfillment/payment enums) and `Coupon` schemas.
- [ ] **Step 2:** Write `computeOrderTotals` (validates coupon active/not-expired/minOrderValue; applies shipping rules from Settings). Add `POST /api/coupons/validate`.
- [ ] **Verify:** Valid coupon returns discount; expired/below-min returns rejection; totals math correct.

### Task 3.4: Checkout page (address → review → payment)

**Files:**
- Create: `src/app/checkout/page.tsx`, `src/components/checkout/{AddressStep,AddressForm,CouponInput,OrderSummary}.tsx`, `src/app/api/orders/route.ts`
- Modify: `lib/validate.ts` (zod schemas), `lib/rateLimit.ts`

**Interfaces:**
- Consumes: `cartStore`, `computeOrderTotals`, saved addresses (Phase 4 — guest form now; SavedAddressPicker added in 4).
- Produces: single responsive checkout (address form w/ 10-digit phone + 6-digit pincode validation, order review, payment method select); `POST /api/orders` creates an Order server-side with recomputed totals (zod + rate-limited); sticky Price details (bottom-sheet mobile).

- [ ] **Step 1:** Build `lib/rateLimit.ts` (in-memory/Upstash-style token bucket) + `lib/validate.ts` order schema.
- [ ] **Step 2:** Build checkout UI (AddressForm, OrderSummary, CouponInput) + `POST /api/orders` (recompute totals, generate orderNumber, save `placed`/`pending`).
- [ ] **Verify:** Guest can fill address + review; `POST /api/orders` rejects tampered prices (recomputes); order row created with correct total.

### Task 3.5: Razorpay create-order + signature-verified webhook + COD

**Files:**
- Create: `src/lib/razorpay.ts`, `src/app/api/razorpay/create-order/route.ts`, `src/app/api/razorpay/webhook/route.ts`, `src/components/checkout/RazorpayButton.tsx`, `src/app/checkout/success/page.tsx`

**Interfaces:**
- Consumes: `Order` model, `env` Razorpay keys.
- Produces: `POST /api/razorpay/create-order` (server creates RZP order, returns `orderId` + public key); `RazorpayButton` opens Checkout; `POST /api/razorpay/webhook` verifies HMAC-SHA256 with `RAZORPAY_WEBHOOK_SECRET` on `payment.captured` and sets `paymentStatus:'paid'`; COD path skips Razorpay and creates `placed`/`pending`.

- [ ] **Step 1:** Implement create-order + `RazorpayButton` (client opens Checkout; on callback shows "verifying payment" — does NOT mark paid).
- [ ] **Step 2:** Implement webhook with raw-body HMAC verification; reject + log invalid signatures; flip `paymentStatus` only on valid `payment.captured`. Implement COD branch.
- [ ] **Step 3:** Build `/checkout/success` (order number, summary, est. ready-by, track link).
- [ ] **Verify (needs Razorpay test keys + tunnel):** Test-mode payment → webhook with valid signature flips to `paid`; a forged-signature request is rejected + logged; COD order created without touching Razorpay; success page shows correct ready-by date.

---

## Phase 4 — User accounts + My Account hub

### Task 4.1: User + Address + Otp models + OTP lib

**Files:**
- Create: `src/models/{User,Otp}.ts`, `src/lib/otp.ts`
- Modify: `scripts/seed.ts` (add 2–3 sample customers w/ addresses + past orders + reviews)

**Interfaces:**
- Produces: `User` (email/phone unique sparse, passwordHash, addresses[], defaultAddressId, wishlist[], recentlyViewed[], notificationPrefs), `Address` subdoc, `Otp` (codeHash, purpose, expiresAt TTL index) per §B5. `lib/otp.ts`: `sendOtp(identifier,purpose)` (6-digit, hashed, TTL 5min, 60s resend, 5/hr), `verifyOtp(identifier,code,purpose)`.

- [ ] **Step 1:** Define User/Address/Otp schemas (TTL index on `expiresAt`).
- [ ] **Step 2:** Write `lib/otp.ts` (bcrypt/sha256 hash, attempt cap, rate limits; dev fallback logs OTP to server console when no SMS creds).
- [ ] **Step 3:** Extend seed with sample customers (addresses, past orders across fulfillment states, approved reviews) so account/order/tracking screens are testable.
- [ ] **Verify:** `sendOtp` logs code in dev; `verifyOtp` accepts within TTL, rejects expired/wrong/over-attempt; seed creates customers with orders.

### Task 4.2: NextAuth (user credentials + phone OTP) + login/register UI

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth.ts`, `src/app/api/otp/send/route.ts`, `src/app/api/otp/verify/route.ts`, `src/app/login/page.tsx`, `src/components/account/OtpInput.tsx`
- Modify: `middleware.ts` (require user session for `/account/*`), `AccountFlyout` (real session), cart stores (server-sync on login)

**Interfaces:**
- Produces: NextAuth with credentials (email+password bcrypt) + phone-OTP providers → session `{userId, name}`; `/api/otp/send|verify` (zod + rate-limited); `/login` with both methods + register; guest→user claim by matching phone.

- [ ] **Step 1:** Write `lib/auth.ts` authOptions (both providers, bcrypt compare, session callback) + route handler.
- [ ] **Step 2:** Build `/login` (email+password and "continue with mobile" → OtpInput) + register; `aria-live` on OTP + errors.
- [ ] **Step 3:** Update `middleware.ts` to redirect unauthenticated `/account/*` → `/login?next=`; wire `AccountFlyout` to session; sync cart/wishlist to server on login.
- [ ] **Verify:** Register + login by email; login by phone OTP (console code); session persists; `AccountFlyout` shows "Hello, <name>"; `/account` redirects when logged out.

### Task 4.3: Account APIs (profile, password, addresses) + ownership

**Files:**
- Create: `src/lib/ownership.ts`, `src/app/api/account/profile/route.ts`, `src/app/api/account/password/route.ts`, `src/app/api/account/addresses/route.ts`, `src/app/api/account/addresses/[id]/route.ts`

**Interfaces:**
- Produces: `requireUser(req)` + `assertOwner(userId, resourceUserId)` in `lib/ownership.ts`; account APIs (GET/PATCH profile w/ email/phone re-verify; POST change-password w/ current-check + strength; addresses CRUD + set-default) — all enforce `userId` ownership + zod + rate-limit.

- [ ] **Step 1:** Write `lib/ownership.ts`.
- [ ] **Step 2:** Implement profile, password, addresses APIs with ownership checks.
- [ ] **Verify:** A user can only read/modify their own data; cross-user request → 403; password change requires correct current password; add/edit/delete/set-default address works.

### Task 4.4: My Account hub + profile/security + addresses pages

**Files:**
- Create: `src/app/account/page.tsx`, `src/app/account/profile/page.tsx`, `src/app/account/addresses/page.tsx`, `src/components/account/{AccountHubGrid,ProfileForm,SecurityPanel,AddressCard,AddressForm}.tsx`

**Interfaces:**
- Consumes: account APIs, most-recent Order.
- Produces: hub (greeting, last-order panel, card grid, buy-again + recently-viewed rails); profile page (personal info + Login & security: password, linked methods, sessions); addresses page (cards + CRUD + default).

- [ ] **Step 1:** Build hub landing per §B3.2.
- [ ] **Step 2:** Build profile+security and addresses pages using the APIs.
- [ ] **Verify:** Hub shows last order + cards; editing profile/password/addresses persists and reflects in UI.

### Task 4.5: Orders list + order detail + invoice + tracking timeline + guest track

**Files:**
- Create: `src/app/account/orders/page.tsx`, `src/app/account/orders/[orderNumber]/page.tsx`, `src/app/account/orders/[orderNumber]/track/page.tsx`, `src/app/track/page.tsx`, `src/app/api/orders/[id]/route.ts`, `src/app/api/orders/track/route.ts`, `src/components/account/{OrderCard,OrderDetail,InvoiceView,StatusTimeline,BuyAgainList}.tsx`, `src/app/account/buy-again/page.tsx`

**Interfaces:**
- Consumes: Order model (by `userId`), `computeOrderTotals`.
- Produces: My Orders list (filters, actions Track/Details/Buy-again/Review/Reorder/Cancel-pre-ship); order detail + client/delivery detail + price breakdown + invoice (print CSS); `StatusTimeline` (placed→delivered w/ timestamps, courier+tracking# when shipped); `/track` guest lookup (order# + phone) reusing StatusTimeline; buy-again re-adds variant to cart.

- [ ] **Step 1:** Build order APIs (`GET /api/orders/[id]` owner-scoped; `POST /api/orders/track` order#+phone match) + `StatusTimeline`.
- [ ] **Step 2:** Build orders list, order detail + `InvoiceView`, tracking page, `/track`, buy-again.
- [ ] **Verify:** Placed order appears in My Orders with correct client+delivery detail; invoice prints; timeline shows history; guest `/track` works with order#+phone but exposes nothing else; buy-again re-adds to cart.

### Task 4.6: Wishlist, coupons, reviews, notifications pages + review API

**Files:**
- Create: `src/app/account/{wishlist,coupons,reviews,notifications}/page.tsx`, `src/app/wishlist/page.tsx`, `src/models/Review.ts`, `src/app/api/reviews/route.ts`, `src/components/reviews/{ReviewList,ReviewForm,RatingBreakdown}.tsx`
- Modify: PDP (mount ReviewList/ReviewForm)

**Interfaces:**
- Produces: `Review` model per §B5; `POST /api/reviews` (default `isApproved:false`; sets `verifiedPurchase` if user has delivered order with product; zod+rate-limit); account wishlist/coupons/reviews/notifications pages; PDP ratings&reviews (breakdown bars, photos, helpful votes, verified tag).

- [ ] **Step 1:** Build Review model + `POST /api/reviews` + review components.
- [ ] **Step 2:** Build the four account pages + mount reviews on PDP.
- [ ] **Verify:** New review saved unapproved (not shown until approved in Phase 5); verifiedPurchase set correctly; wishlist move-to-cart works; notification toggles persist.

---

## Phase 5 — Admin + CMS + analytics

### Task 5.1: AdminUser model + seed-admin + admin auth + RBAC + guard

**Files:**
- Create: `src/models/AdminUser.ts`, `scripts/seed-admin.ts`, `src/lib/rbac.ts`, `src/app/admin/login/page.tsx`
- Modify: `lib/auth.ts` (admin credentials flow, session `{adminId, role}`), `middleware.ts` (guard `/admin/*`)

**Interfaces:**
- Produces: `AdminUser` (bcrypt, role enum owner/manager/staff, isActive); `seed-admin.ts` reads `SEED_OWNER_*` once → hashes owner into DB; `requireRole(role)` server-side; `/admin/login`; middleware admin guard.

- [ ] **Step 1:** Define AdminUser; write `seed-admin.ts` (`npm run seed:admin`).
- [ ] **Step 2:** Add admin credentials provider + `lib/rbac.ts`; guard `/admin/*` in middleware.
- [ ] **Verify:** `npm run seed:admin` creates owner; `/admin/login` authenticates; unauthenticated `/admin` redirects; a staff-role session is blocked from owner-only APIs (403).

### Task 5.2: Admin shell + dashboard + analytics

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/components/admin/{StatCard,AnalyticsCharts}.tsx`

**Interfaces:**
- Consumes: Order data.
- Produces: role-aware sidebar shell; dashboard stat cards (today's orders/revenue, pending/unshipped, low-lead alerts) + Recharts charts (revenue/orders over time, top products, sales by category, payment split, new vs returning) + date-range filter + recent orders table.

- [ ] **Step 1:** Build admin layout + StatCard.
- [ ] **Step 2:** Build dashboard + AnalyticsCharts (Recharts, no CDN).
- [ ] **Verify:** Dashboard renders real seeded metrics; date-range filter updates charts.

### Task 5.3: Products + Categories admin + ImageKit signed upload

**Files:**
- Create: `src/app/admin/products/{page,new/page,[id]/edit/page}.tsx`, `src/app/admin/categories/page.tsx`, `src/components/admin/{ProductForm,VariantRowBuilder,ImageUploader}.tsx`, `src/lib/imagekit.ts`, `src/app/api/imagekit/auth/route.ts`
- Modify: `/api/products`, `/api/categories` (POST/PATCH/DELETE, RBAC)

**Interfaces:**
- Produces: `GET /api/imagekit/auth` (signed upload token; type/size validated server-side); `ProductForm` w/ drag-drop multi-image + `VariantRowBuilder`; product/category CRUD (soft delete `isActive:false`), RBAC manager+.

- [ ] **Step 1:** Build ImageKit lib + signed auth route + `ImageUploader`.
- [ ] **Step 2:** Build ProductForm + VariantRowBuilder + product/category CRUD APIs & pages.
- [ ] **Verify (needs ImageKit keys):** Create a product with uploaded images + variants; edit; soft-delete hides from storefront; categories reorder.

### Task 5.4: Orders admin (fulfillment + tracking gate) + packing slip

**Files:**
- Create: `src/app/admin/orders/{page,[id]/page}.tsx`, `src/components/admin/{OrderStatusStepper,PackingSlip}.tsx`
- Modify: `/api/orders/[id]` (admin PATCH status, RBAC staff+)

**Interfaces:**
- Produces: filterable orders table w/ color-coded status badges (placed=gray, in_progress=warning, ready=info, shipped=brand, delivered=success, cancelled=muted); order detail + `OrderStatusStepper`; **advancing to "shipped" requires trackingNumber + courierName** (fires shipped notification in Phase 6); printable packing slip + invoice.

- [ ] **Step 1:** Build orders table + detail + stepper; enforce tracking#+courier required at "shipped" server-side.
- [ ] **Step 2:** Build PackingSlip + invoice print views.
- [ ] **Verify:** Advance a test order placed→...→shipped; "shipped" blocked until tracking#+courier provided; delivered sets success badge; statusHistory recorded.

### Task 5.5: Customers, custom-orders, reviews, coupons admin

**Files:**
- Create: `src/app/admin/customers/{page,[id]/page}.tsx`, `src/app/admin/custom-orders/page.tsx`, `src/app/admin/reviews/page.tsx`, `src/app/admin/coupons/page.tsx`, `src/models/CustomOrder.ts`, `src/app/api/{customers,custom-orders,reviews,coupons}/route.ts`, `src/app/custom-order/page.tsx`, `src/components/admin/CustomerTable.tsx`
- Modify: `/api/reviews` (approve → recompute product ratingAvg/ratingCount)

**Interfaces:**
- Produces: `CustomOrder` model; admin customers (read-only list/search + their orders/addresses/LTV — no password access); custom-orders queue (status + internal note); reviews approve/reject (recompute rating); coupons CRUD; public `/custom-order` form → `POST /api/custom-orders`.

- [ ] **Step 1:** Build CustomOrder model + public `/custom-order` form + API.
- [ ] **Step 2:** Build admin customers, custom-orders, reviews (approve recomputes rating), coupons pages/APIs.
- [ ] **Verify:** Customer list shows registered users + orders; approving a review makes it visible on PDP and updates ratingAvg; coupon created + usable at checkout; custom-order submission appears in queue.

### Task 5.6: CMS content, pages, users, admin account

**Files:**
- Create: `src/app/admin/content/page.tsx`, `src/app/admin/pages/{page,[slug]/edit/page}.tsx`, `src/app/admin/users/page.tsx`, `src/app/admin/account/page.tsx`, `src/models/{Banner,Page}.ts`, `src/app/api/{settings,banners,pages,admin-users}/route.ts`, `src/components/admin/{BannerBuilder,ContentEditor,RichTextEditor,UserForm,PasswordChangeForm}.tsx`, `src/lib/sanitize.ts`, `src/app/policies/[slug]/page.tsx`
- Modify: revalidate affected paths on save

**Interfaces:**
- Produces: `Banner` + `Page` models; CMS content editor (banners carousel builder w/ drag-reorder + schedule, home sections, footer, announcement, branding, SEO defaults) w/ live preview; policy `Pages` rich-text (sanitized); owner-only admin `Users` mgmt; admin `account` password change; public `/policies/[slug]`.

- [ ] **Step 1:** Build Banner/Page models + `lib/sanitize.ts` + settings/banners/pages APIs (RBAC, revalidate on save).
- [ ] **Step 2:** Build content editor, pages editor, users (owner-only), admin account, public policy pages.
- [ ] **Verify:** Editing logo/banners/home sections/footer/a policy page reflects on storefront without redeploy (ISR revalidate); XSS payload in rich-text is sanitized; owner can create a second admin; admin can change own password.

---

## Phase 6 — Notifications, SEO/GEO, a11y, polish

### Task 6.1: Notifications lib + triggers

**Files:**
- Create: `src/lib/notify.ts`
- Modify: razorpay webhook, orders API (COD), admin order status (shipped/delivered), custom-orders API, otp lib

**Interfaces:**
- Produces: `notify.orderConfirmed/orderShipped/orderDelivered/customOrderReceived/sendOtp` using WhatsApp Cloud API + email fallback (Resend/SMTP) + SMS for OTP; missing `WHATSAPP_API_TOKEN` silently falls back to email; called only from server/API routes.

- [ ] **Step 1:** Build `lib/notify.ts` with provider abstraction + graceful fallbacks.
- [ ] **Step 2:** Wire triggers (paid webhook/COD → confirm; shipped → tracking msg; delivered → review link; new custom order → admin; OTP send).
- [ ] **Verify:** With no WhatsApp token, confirmation falls back to email (or logs) without throwing; shipped notification includes tracking#; OTP path logs in dev.

### Task 6.2: SEO/GEO + sitemap/robots + JSON-LD

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`
- Modify: `layout.tsx` (Organization + WebSite + LocalBusiness JSON-LD, OG/Twitter, `en-IN`, canonical), PDP (Product/Breadcrumb JSON-LD already in 2.5 — verify)

**Interfaces:**
- Produces: dynamic sitemap (products/categories/pages), robots, site-wide Organization/WebSite/LocalBusiness (Tamil Nadu address, geo, hours, WhatsApp, INR) JSON-LD, OG/Twitter cards, canonical URLs.

- [ ] **Step 1:** Build sitemap + robots.
- [ ] **Step 2:** Add site-wide JSON-LD + metadata defaults from Settings.seoDefaults.
- [ ] **Verify:** `/sitemap.xml` + `/robots.txt` resolve; JSON-LD validates in Rich Results Test; Lighthouse SEO > 90.

### Task 6.3: A11y + performance pass + analytics flags + final report

**Files:**
- Modify: interactive components (aria-live, focus management), image usages (ImageKit transforms, locked aspect ratios), `src/lib/analytics.ts`
- Create: `src/lib/analytics.ts`

**Interfaces:**
- Produces: GA4 + Meta Pixel (feature-flagged via `NEXT_PUBLIC_*`) firing login/sign_up/add_to_cart/begin_checkout/purchase; a11y (keyboard nav, contrast, reduced-motion) + perf (lazy images, zero CLS) verified.

- [ ] **Step 1:** Add analytics lib + event calls behind env flags.
- [ ] **Step 2:** A11y + performance sweep across breakpoints (320/375/768/1024/1440).
- [ ] **Step 3:** Write the final "simplified/stubbed/placeholder" report (OTP/SMS wiring, webhook, ImageKit, variant builder, sanitizer, pincode→city lookup, roles, notifications).
- [ ] **Verify:** Lighthouse mobile perf > 85, a11y > 90, SEO > 90; analytics events fire when flags set; no horizontal scroll any breakpoint; no console errors; full register→buy→track→review cycle works in test mode.

---

## Self-Review notes

- **Spec coverage:** every Part A section (§1 design, §2 brand, §3 stack, §4 accounts, §5 admin, §6 models, §7 pages, §8 security, §9 notifications, §10 env, §11 perf/SEO/a11y, §12 delivery) maps to a task above. Definition-of-done items are covered by the Phase 6.3 final verify.
- **Deferred cross-refs:** cart-count/session placeholders in Phases 1–2 are intentionally wired in Phases 3–4; each is marked in its task.
- **External-credential gates:** Tasks 3.5 (Razorpay), 5.3 (ImageKit), and real SMS/WhatsApp (4.1/6.1) are the only verifications that need live credentials; all others verify with `MONGODB_URI` + dev fallbacks.
- **Open items to confirm with owner before/at execution:** pincode→city/state lookup source; SMS provider choice; WhatsApp template approval; exact courier-tracking external link format.
