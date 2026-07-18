import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { Product, type ProductRaw } from "@/models/Product";
import { requireAdmin } from "@/lib/adminAuth";
import { adminProductSchema, slugify } from "@/lib/validate";

export const dynamic = "force-dynamic";

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

// Full product for the edit form.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  if (!isValidObjectId(params.id)) return notFound();
  await dbConnect();
  const p = await Product.findById(params.id).lean<ProductRaw>().exec();
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: { ...p, id: String(p._id), category: String(p.category) } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  if (!isValidObjectId(params.id)) return notFound();

  const body = await req.json().catch(() => null);
  const parsed = adminProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid product" }, { status: 400 });

  await dbConnect();
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const clash = await Product.findOne({ slug, _id: { $ne: params.id } }).exec();
  if (clash) return NextResponse.json({ error: "Slug already in use." }, { status: 409 });

  await Product.updateOne(
    { _id: params.id },
    {
      ...parsed.data,
      slug,
      variants: parsed.data.variants.map((v) => ({ ...v, size: v.size || undefined, sku: v.sku || undefined })),
    },
  ).exec();

  revalidatePath(`/product/${slug}`);
  revalidatePath("/shop");
  return NextResponse.json({ ok: true, slug });
}

// Soft delete.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  if (!isValidObjectId(params.id)) return notFound();
  await dbConnect();
  await Product.updateOne({ _id: params.id }, { isActive: false }).exec();
  revalidatePath("/shop");
  return NextResponse.json({ ok: true });
}
