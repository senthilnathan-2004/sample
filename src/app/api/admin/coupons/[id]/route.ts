import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Toggle active / delete a coupon.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  await dbConnect();
  await Coupon.updateOne({ _id: params.id }, { isActive: !!body.isActive }).exec();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await dbConnect();
  await Coupon.deleteOne({ _id: params.id }).exec();
  return NextResponse.json({ ok: true });
}
