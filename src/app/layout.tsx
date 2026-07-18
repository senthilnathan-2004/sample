import type { Metadata } from "next";
import { Baloo_2, Poppins, Cutive_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { DEFAULT_CATEGORIES } from "@/lib/nav";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { CategoryStrip } from "@/components/layout/CategoryStrip";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { StoreChrome } from "@/components/layout/StoreChrome";
import { SiteJsonLd } from "@/components/layout/SiteJsonLd";
import { Analytics } from "@/components/Analytics";

// Fonts loaded via next/font (self-hosted, no CDN). Exposed as CSS variables
// consumed by the Tailwind font tokens (font-heading / font-body / font-accent).
const heading = Baloo_2({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-heading",
  display: "swap",
});
const body = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
const accent = Cutive_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-accent",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    title: { default: s.seoDefaults.title, template: `%s · ${s.branding.siteName}` },
    description: s.seoDefaults.description,
    metadataBase: new URL(base),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: s.branding.siteName,
      title: s.seoDefaults.title,
      description: s.seoDefaults.description,
      ...(s.seoDefaults.ogImage ? { images: [s.seoDefaults.ogImage] } : {}),
    },
    twitter: { card: "summary_large_image", title: s.seoDefaults.title, description: s.seoDefaults.description },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  // Phase 2 replaces DEFAULT_CATEGORIES with DB categories fetched here.
  const categories = DEFAULT_CATEGORIES;

  return (
    <html lang="en-IN" className={`${heading.variable} ${body.variable} ${accent.variable}`}>
      <body className="min-h-screen bg-white text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-control focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SiteJsonLd settings={settings} />
        <Analytics />
        <AuthProvider>
          <StoreChrome
            announcement={<AnnouncementBar bar={settings.announcementBar} />}
            header={<Header branding={settings.branding} categories={categories} />}
            strip={<CategoryStrip categories={categories} />}
            footer={<Footer settings={settings} categories={categories} />}
            tabBar={<MobileTabBar />}
          >
            {children}
          </StoreChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
