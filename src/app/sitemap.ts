import type { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Page } from "@/models/Page";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/shop", "/track"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
  }));

  try {
    await dbConnect();
    const [products, categories, pages] = await Promise.all([
      Product.find({ isActive: true }).select("slug updatedAt").lean().exec(),
      Category.find({ isActive: true }).select("slug").lean().exec(),
      Page.find().select("slug updatedAt").lean().exec(),
    ]);
    return [
      ...staticRoutes,
      ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt })),
      ...categories.map((c) => ({ url: `${base}/shop/${c.slug}` })),
      ...pages.map((p) => ({ url: `${base}/policies/${p.slug}`, lastModified: p.updatedAt })),
    ];
  } catch {
    return staticRoutes;
  }
}
