import { dbConnect } from "@/lib/db";
import { Banner } from "@/models/Banner";
import { Product, type ProductRaw } from "@/models/Product";
import { getCategories } from "@/lib/catalog";
import type { ProductDTO } from "@/types";
import { BannerCarousel, type Banner as BannerT } from "@/components/home/BannerCarousel";
import { CategoryRail } from "@/components/home/CategoryRail";
import { DealsRail } from "@/components/home/DealsRail";
import { TrustProps } from "@/components/home/TrustProps";
import { HowItWorks } from "@/components/home/HowItWorks";
import { RecentlyViewedRail } from "@/components/home/RecentlyViewedRail";
import { BuyAgainRail } from "@/components/home/BuyAgainRail";

export const revalidate = 60;

function toDTO(p: ProductRaw): ProductDTO {
  const disc =
    p.compareAtPrice && p.compareAtPrice > p.basePrice
      ? Math.round(((p.compareAtPrice - p.basePrice) / p.compareAtPrice) * 100)
      : 0;
  return {
    id: String(p._id),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    care: p.care,
    category: { name: "", slug: "" },
    images: p.images ?? [],
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    discountPct: disc,
    variants: (p.variants ?? []).map((v) => ({
      color: v.color,
      size: v.size,
      customTextAllowed: !!v.customTextAllowed,
      priceDelta: v.priceDelta ?? 0,
      stock: v.stock ?? null,
      sku: v.sku,
    })),
    leadTimeDays: p.leadTimeDays ?? 4,
    isCustomizable: !!p.isCustomizable,
    isBestseller: !!p.isBestseller,
    tags: p.tags ?? [],
    ratingAvg: p.ratingAvg ?? 0,
    ratingCount: p.ratingCount ?? 0,
  };
}

async function getHomeData() {
  try {
    await dbConnect();
    const [bannerRows, bestRows, dealRows, categories] = await Promise.all([
      Banner.find({ isActive: true }).sort({ sortOrder: 1 }).lean().exec(),
      Product.find({ isActive: true, isBestseller: true }).limit(5).lean<ProductRaw[]>().exec(),
      Product.find({ isActive: true, compareAtPrice: { $gt: 0 } }).sort({ createdAt: -1 }).limit(5).lean<ProductRaw[]>().exec(),
      getCategories(),
    ]);
    const banners: BannerT[] = bannerRows.map((b) => ({
      image: b.image,
      headline: b.headline ?? undefined,
      subtext: b.subtext ?? undefined,
      ctaText: b.ctaText ?? undefined,
      ctaLink: b.ctaLink ?? undefined,
    }));
    return {
      banners,
      bestsellers: bestRows.map(toDTO),
      deals: dealRows.map(toDTO),
      categories,
    };
  } catch {
    return { banners: [], bestsellers: [], deals: [], categories: [] };
  }
}

export default async function HomePage() {
  const { banners, bestsellers, deals, categories } = await getHomeData();

  return (
    <div className="mx-auto max-w-page px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      {/* Zepto-style category rail directly under the header */}
      <CategoryRail categories={categories} />

      {/* Optional CMS hero carousel */}
      {banners.length > 0 && (
        <div className="mt-4">
          <BannerCarousel banners={banners} />
        </div>
      )}

      <BuyAgainRail />
      <DealsRail title="Bestsellers" products={bestsellers} viewAllHref="/shop" />
      <HowItWorks />
      <DealsRail title="Deals for you" products={deals} viewAllHref="/shop?sort=discount" />
      <RecentlyViewedRail />
      <TrustProps />
    </div>
  );
}
