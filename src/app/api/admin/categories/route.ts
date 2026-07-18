import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Category } from "@/models/Category";
import { requireAdmin } from "@/lib/adminAuth";
import { adminCategorySchema, slugify } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  await dbConnect();
  const rows = await Category.find().sort({ sortOrder: 1, name: 1 }).lean().exec();
  return NextResponse.json({
    categories: rows.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: c.description,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = adminCategorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  await dbConnect();
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  const exists = await Category.findOne({ slug }).exec();
  if (exists) return NextResponse.json({ error: "Slug already in use." }, { status: 409 });

  const created = await Category.create({ ...parsed.data, slug });
  revalidatePath("/");
  revalidatePath("/shop");
  return NextResponse.json({ ok: true, id: String(created._id) });
}
