import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

// Change own admin password (verifies current).
export async function POST(req: Request) {
  const auth = await requireAdmin("staff");
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const admin = await AdminUser.findById(auth.session.adminId).exec();
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
  if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });

  admin.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await admin.save();
  return NextResponse.json({ ok: true });
}
