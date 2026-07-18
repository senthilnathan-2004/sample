import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { Category } from "@/models/Category";
import { requireAdmin } from "@/lib/adminAuth";
import { adminCategorySchema, slugify } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = adminCategorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid category" }, { status: 400 });

  await dbConnect();
  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);
  await Category.updateOne({ _id: params.id }, { ...parsed.data, slug }).exec();
  revalidatePath("/");
  revalidatePath("/shop");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await dbConnect();
  await Category.updateOne({ _id: params.id }, { isActive: false }).exec();
  revalidatePath("/shop");
  return NextResponse.json({ ok: true });
}
