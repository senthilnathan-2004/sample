import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Product } from "@/models/Product";
import { requireAdmin } from "@/lib/adminAuth";
import { adminProductSchema, slugify } from "@/lib/validate";

export const dynamic = "force-dynamic";

// List all products (including inactive) for the admin table.
export async function GET() {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  await dbConnect();
  const rows = await Product.find().populate("category", "name slug").sort({ createdAt: -1 }).lean().exec();
  return NextResponse.json({
    products: rows.map((p) => ({
      id: String(p._id),
      name: p.name,
      slug: p.slug,
      category: (p.category as { name?: string })?.name ?? "",
      basePrice: p.basePrice,
      isActive: p.isActive,
      isBestseller: p.isBestseller,
      image: p.images?.[0],
      variants: p.variants?.length ?? 0,
    })),
  });
}

// Create a product.
export async function POST(req: Request) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product", issues: parsed.error.flatten() }, { status: 400 });
  }

  await dbConnect();
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const exists = await Product.findOne({ slug }).exec();
  if (exists) return NextResponse.json({ error: "Slug already in use." }, { status: 409 });

  const created = await Product.create({
    ...parsed.data,
    slug,
    variants: parsed.data.variants.map((v) => ({ ...v, size: v.size || undefined, sku: v.sku || undefined })),
  });
  return NextResponse.json({ ok: true, id: String(created._id), slug });
}
