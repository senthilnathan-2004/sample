import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";
import { signAdminToken, ADMIN_COOKIE, adminCookieOptions } from "@/lib/adminAuth";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const rl = rateLimit(`admin-login:${clientIp(req)}`, 10, 15 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const admin = await AdminUser.findOne({ email: parsed.data.email.toLowerCase().trim() }).exec();
  if (!admin || !admin.isActive) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }
  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = await signAdminToken({ adminId: String(admin._id), role: admin.role, name: admin.name });
  const res = NextResponse.json({ ok: true, role: admin.role, name: admin.name });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return res;
}
