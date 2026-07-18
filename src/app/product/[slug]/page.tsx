import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelated } from "@/lib/catalog";
import { getApprovedReviews } from "@/lib/reviews";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ImageGallery } from "@/components/product/ImageGallery";
import { PdpInteractive } from "@/components/product/PdpInteractive";
import { ProductTabs } from "@/components/product/ProductTabs";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { RatingBreakdown } from "@/components/reviews/RatingBreakdown";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [product.images[0]] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelated(product),
    getApprovedReviews(product.id),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Product JSON-LD (SEO).
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    category: product.category.name,
    brand: { "@type": "Brand", name: "Lara's Pinnal" },
    aggregateRating:
      product.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.ratingCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      price: product.basePrice,
      priceCurrency: "INR",
      availability: "https://schema.org/MadeToOrder",
      url: `${siteUrl}/product/${product.slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${siteUrl}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category.name,
        item: `${siteUrl}/shop/${product.category.slug}`,
      },
      { "@type": "ListItem", position: 4, name: product.name },
    ],
  };

  return (
    <div className="mx-auto max-w-page px-4 pt-8 pb-32 lg:pb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.category.name, href: `/shop/${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-4 grid gap-8 md:grid-cols-[minmax(0,22rem)_1fr] lg:grid-cols-[minmax(0,26rem)_1fr]">
        <ImageGallery images={product.images} alt={product.name} />
        <PdpInteractive product={product} />
      </div>

      <ProductTabs description={product.description} care={product.care} />

      {/* Ratings & reviews */}
      <section id="reviews" className="mt-10 border-t border-hairline pt-6">
        <h2 className="font-heading text-xl font-bold">Ratings &amp; reviews</h2>
        {reviews.count > 0 && (
          <div className="mt-4">
            <RatingBreakdown
              average={reviews.average}
              count={reviews.count}
              breakdown={reviews.breakdown}
            />
          </div>
        )}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <ReviewList reviews={reviews.reviews} />
          <ReviewForm productId={product.id} />
        </div>
      </section>

      <RelatedProducts products={related} />
    </div>
  );
}
