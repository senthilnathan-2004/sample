import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { requireAdmin } from "@/lib/adminAuth";
import { adminCouponSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;
  await dbConnect();
  const rows = await Coupon.find().sort({ createdAt: -1 }).lean().exec();
  return NextResponse.json({
    coupons: rows.map((c) => ({
      id: String(c._id),
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderValue: c.minOrderValue,
      expiry: c.expiry,
      isActive: c.isActive,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = adminCouponSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });

  await dbConnect();
  const code = parsed.data.code.toUpperCase().trim();
  const exists = await Coupon.findOne({ code }).exec();
  if (exists) return NextResponse.json({ error: "Code already exists." }, { status: 409 });

  await Coupon.create({
    ...parsed.data,
    code,
    expiry: parsed.data.expiry ? new Date(parsed.data.expiry) : undefined,
  });
  return NextResponse.json({ ok: true });
}
