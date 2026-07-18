import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";
import { requireAdmin } from "@/lib/adminAuth";
import { adminUserSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

// Owner-only: list + create admin users.
export async function GET() {
  const auth = await requireAdmin("owner");
  if (auth.response) return auth.response;
  await dbConnect();
  const rows = await AdminUser.find().select("name email role isActive lastLoginAt").lean().exec();
  return NextResponse.json({
    users: rows.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
    })),
  });
}

export async function POST(req: Request) {
  const auth = await requireAdmin("owner");
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = adminUserSchema.safeParse(body);
  if (!parsed.success || !parsed.data.password) {
    return NextResponse.json({ error: "Name, email, password and role are required." }, { status: 400 });
  }

  await dbConnect();
  const email = parsed.data.email.toLowerCase().trim();
  if (await AdminUser.findOne({ email }).exec()) {
    return NextResponse.json({ error: "An admin with this email exists." }, { status: 409 });
  }
  await AdminUser.create({
    name: parsed.data.name,
    email,
    passwordHash: await bcrypt.hash(parsed.data.password, 10),
    role: parsed.data.role,
    isActive: parsed.data.isActive,
  });
  return NextResponse.json({ ok: true });
}
