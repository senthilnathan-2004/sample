import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { requireUserId } from "@/lib/ownership";
import { notificationPrefsSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = notificationPrefsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await dbConnect();
  await User.updateOne({ _id: auth.userId }, { notificationPrefs: parsed.data }).exec();
  return NextResponse.json({ ok: true });
}
