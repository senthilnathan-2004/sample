import { dbConnect } from "./db";
import { Product, type ProductRaw } from "@/models/Product";
import { Category } from "@/models/Category";
import type {
  ProductDTO,
  CategoryDTO,
  SortKey,
  FacetCounts,
  ProductQueryResult,
  VariantDTO,
} from "@/types";

export type ProductFilters = {
  category?: string; // slug
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  rating?: number; // minimum ratingAvg
  availability?: "made-to-order" | "in-stock";
  sort?: SortKey;
  page?: number;
  pageSize?: number;
};

const PAGE_SIZE = 12;

function discountPct(basePrice: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= basePrice) return 0;
  return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
}

function serializeProduct(
  p: ProductRaw & { category?: { name: string; slug: string } | unknown },
): ProductDTO {
  const cat = p.category as { name?: string; slug?: string } | undefined;
  const variants: VariantDTO[] = (p.variants ?? []).map((v) => ({
    color: v.color,
    size: v.size,
    customTextAllowed: !!v.customTextAllowed,
    priceDelta: v.priceDelta ?? 0,
    stock: v.stock ?? null,
    sku: v.sku,
  }));
  return {
    id: String(p._id),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    care: p.care,
    category: { name: cat?.name ?? "", slug: cat?.slug ?? "" },
    images: p.images ?? [],
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    discountPct: discountPct(p.basePrice, p.compareAtPrice),
    variants,
    leadTimeDays: p.leadTimeDays ?? 4,
    isCustomizable: !!p.isCustomizable,
    isBestseller: !!p.isBestseller,
    tags: p.tags ?? [],
    ratingAvg: p.ratingAvg ?? 0,
    ratingCount: p.ratingCount ?? 0,
  };
}

const sortStage: Record<SortKey, Record<string, 1 | -1>> = {
  popularity: { isBestseller: -1, ratingCount: -1, createdAt: -1 },
  "price-asc": { basePrice: 1 },
  "price-desc": { basePrice: -1 },
  newest: { createdAt: -1 },
  rating: { ratingAvg: -1, ratingCount: -1 },
  discount: { discountPct: -1 },
};

export async function getCategories(): Promise<CategoryDTO[]> {
  await dbConnect();
  const rows = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean().exec();
  return rows.map((c) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? undefined,
    image: c.image ?? undefined,
    description: c.description ?? undefined,
    sortOrder: c.sortOrder ?? 0,
  }));
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  await dbConnect();
  const p = await Product.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .lean<ProductRaw & { category: { name: string; slug: string } }>()
    .exec();
  return p ? serializeProduct(p) : null;
}

/**
 * Main catalog query. Filters narrow the item list; facet counts are computed
 * over the active-products-under-current-search base (excluding the price/color/
 * rating/category selections) so each facet shows how many products it would match.
 */
export async function queryProducts(filters: ProductFilters): Promise<ProductQueryResult> {
  await dbConnect();

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE;
  const sort = sortStage[filters.sort ?? "popularity"];

  // Category slug -> ObjectId (facet base uses ids too).
  const cats = await Category.find({ isActive: true }).select("_id slug name").lean().exec();
  const slugToId = new Map(cats.map((c) => [c.slug, c._id]));
  const idToCat = new Map(cats.map((c) => [String(c._id), { slug: c.slug, name: c.name }]));

  // Text search over name/description/tags (substring, case-insensitive).
  const qMatch = filters.q
    ? {
        $or: [
          { name: { $regex: filters.q, $options: "i" } },
          { tags: { $regex: filters.q, $options: "i" } },
          { description: { $regex: filters.q, $options: "i" } },
        ],
      }
    : {};

  // Top-level match: everything that also governs facet counts.
  const baseMatch: Record<string, unknown> = { isActive: true, ...qMatch };

  // Item-level match: adds the user-selected facet filters.
  const itemMatch: Record<string, unknown> = {};
  if (filters.category && slugToId.has(filters.category)) {
    itemMatch.category = slugToId.get(filters.category);
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    itemMatch.basePrice = {
      ...(filters.minPrice != null ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { $lte: filters.maxPrice } : {}),
    };
  }
  if (filters.colors && filters.colors.length) {
    itemMatch["variants.color"] = { $in: filters.colors };
  }
  if (filters.rating != null) {
    itemMatch.ratingAvg = { $gte: filters.rating };
  }
  if (filters.availability === "made-to-order") {
    itemMatch["variants.stock"] = null;
  } else if (filters.availability === "in-stock") {
    itemMatch["variants.stock"] = { $ne: null, $gt: 0 };
  }

  const [result] = await Product.aggregate([
    { $match: baseMatch },
    {
      $addFields: {
        discountPct: {
          $cond: [
            { $and: [{ $gt: ["$compareAtPrice", 0] }, { $gt: ["$compareAtPrice", "$basePrice"] }] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: [{ $subtract: ["$compareAtPrice", "$basePrice"] }, "$compareAtPrice"] },
                    100,
                  ],
                },
                0,
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $facet: {
        items: [
          { $match: itemMatch },
          { $sort: sort },
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        ],
        total: [{ $match: itemMatch }, { $count: "n" }],
        fCategories: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
        fColors: [
          { $unwind: "$variants" },
          { $group: { _id: "$variants.color", count: { $sum: 1 } } },
        ],
        fPrice: [{ $group: { _id: null, min: { $min: "$basePrice" }, max: { $max: "$basePrice" } } }],
        fRatings: [
          {
            $group: {
              _id: null,
              r4: { $sum: { $cond: [{ $gte: ["$ratingAvg", 4] }, 1, 0] } },
              r3: { $sum: { $cond: [{ $gte: ["$ratingAvg", 3] }, 1, 0] } },
              r2: { $sum: { $cond: [{ $gte: ["$ratingAvg", 2] }, 1, 0] } },
              r1: { $sum: { $cond: [{ $gte: ["$ratingAvg", 1] }, 1, 0] } },
            },
          },
        ],
      },
    },
  ]).exec();

  const items: ProductDTO[] = (result?.items ?? []).map((p: ProductRaw & { category: { name: string; slug: string } }) =>
    serializeProduct(p),
  );
  const total: number = result?.total?.[0]?.n ?? 0;

  const categories: Record<string, number> = {};
  for (const row of result?.fCategories ?? []) {
    const cat = idToCat.get(String(row._id));
    if (cat) categories[cat.slug] = row.count;
  }
  const colors: Record<string, number> = {};
  for (const row of result?.fColors ?? []) {
    if (row._id) colors[row._id] = row.count;
  }
  const rr = result?.fRatings?.[0] ?? {};
  const ratings: Record<string, number> = {
    "4": rr.r4 ?? 0,
    "3": rr.r3 ?? 0,
    "2": rr.r2 ?? 0,
    "1": rr.r1 ?? 0,
  };
  const price = result?.fPrice?.[0] ?? { min: 0, max: 0 };

  const facetCounts: FacetCounts = {
    categories,
    colors,
    ratings,
    priceMin: Math.floor(price.min ?? 0),
    priceMax: Math.ceil(price.max ?? 0),
  };

  return { items, total, facetCounts, page, pageSize };
}

/** Suggestions for the header autocomplete (Task 2.6). */
export async function suggest(q: string, limit = 6): Promise<{ name: string; slug: string }[]> {
  await dbConnect();
  if (!q.trim()) return [];
  const rows = await Product.find({
    isActive: true,
    $or: [{ name: { $regex: q, $options: "i" } }, { tags: { $regex: q, $options: "i" } }],
  })
    .select("name slug")
    .limit(limit)
    .lean()
    .exec();
  return rows.map((r) => ({ name: r.name, slug: r.slug }));
}

/** Related products in the same category (PDP rail). */
export async function getRelated(product: ProductDTO, limit = 6): Promise<ProductDTO[]> {
  await dbConnect();
  const cat = await Category.findOne({ slug: product.category.slug }).select("_id").lean().exec();
  if (!cat) return [];
  const rows = await Product.find({ isActive: true, category: cat._id, slug: { $ne: product.slug } })
    .populate("category", "name slug")
    .limit(limit)
    .lean<(ProductRaw & { category: { name: string; slug: string } })[]>()
    .exec();
  return rows.map((p) => serializeProduct(p));
}
