import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validate";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Email+password registration. On success the client calls signIn('credentials').
export async function POST(req: Request) {
  const rl = rateLimit(`register:${clientIp(req)}`, 5, 60 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  await dbConnect();
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await User.findOne({ email }).exec();
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await User.create({
    name: parsed.data.name,
    email,
    passwordHash,
    emailVerified: false,
    isActive: true,
  });

  return NextResponse.json({ ok: true });
}
