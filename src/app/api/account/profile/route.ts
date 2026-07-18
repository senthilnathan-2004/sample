import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { requireUserId } from "@/lib/ownership";
import { profileSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

// GET own profile.
export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  await dbConnect();
  const user = await User.findById(auth.userId)
    .select("name email phone avatar emailVerified phoneVerified notificationPrefs")
    .lean()
    .exec();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user: { ...user, _id: undefined, id: auth.userId } });
}

// PATCH name/avatar. Email/phone changes require OTP re-verification (separate flow).
export async function PATCH(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  const update: Record<string, unknown> = {};
  if (parsed.data.name) update.name = parsed.data.name;
  if (parsed.data.avatar !== undefined) update.avatar = parsed.data.avatar || undefined;

  await User.updateOne({ _id: auth.userId }, update).exec();
  return NextResponse.json({ ok: true });
}
