import type { SettingsShape } from "@/types";

// Site-wide Organization + WebSite + LocalBusiness JSON-LD (SEO + local/GEO).
export function SiteJsonLd({ settings }: { settings: SettingsShape }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { branding, commerce } = settings;

  const graph = [
    {
      "@type": "Organization",
      "@id": `${base}/#org`,
      name: branding.siteName,
      url: base,
      description: settings.seoDefaults.description,
      sameAs: branding.social.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: base,
      name: branding.siteName,
      publisher: { "@id": `${base}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${base}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${base}/#localbusiness`,
      name: branding.siteName,
      description: `${branding.tagline} — handmade crochet, made to order.`,
      url: base,
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
        ...(commerce.businessAddress ? { streetAddress: commerce.businessAddress } : {}),
      },
      ...(commerce.whatsappNumber ? { telephone: commerce.whatsappNumber } : {}),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
