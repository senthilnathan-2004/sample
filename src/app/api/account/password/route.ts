import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { requireUserId } from "@/lib/ownership";
import { passwordChangeSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

/**
 * Change/set password. If the account already has a password, the current one
 * must be supplied and correct. Phone-only accounts can set an initial password.
 */
export async function POST(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const user = await User.findById(auth.userId).exec();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.passwordHash) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json({ error: "Current password required." }, { status: 400 });
    }
    const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await user.save();
  return NextResponse.json({ ok: true });
}
