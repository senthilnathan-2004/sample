/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

// Content Security Policy. Razorpay + ImageKit hosts are allowlisted for later phases.
// 'unsafe-inline'/'unsafe-eval' on scripts is required by Next.js dev + framer-motion;
// tighten with nonces in a later hardening pass if desired.
const csp = [
  "default-src 'self'",
  // Analytics hosts included so GA4/Meta Pixel work IF enabled via env flags.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  // picsum.photos/unsplash are for seed/demo photos only; drop them in production.
  "img-src 'self' data: blob: https://ik.imagekit.io https://images.unsplash.com https://picsum.photos https://fastly.picsum.photos",
  "font-src 'self' data:",
  "connect-src 'self' https://ik.imagekit.io https://upload.imagekit.io https://*.razorpay.com https://lumberjack.razorpay.com https://www.google-analytics.com https://region1.google-analytics.com",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
