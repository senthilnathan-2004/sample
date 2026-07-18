import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { requireUserId } from "@/lib/ownership";
import { addressSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

// List own addresses.
export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;
  await dbConnect();
  const user = await User.findById(auth.userId).select("addresses defaultAddressId").lean().exec();
  return NextResponse.json({
    addresses: (user?.addresses ?? []).map((a) => ({ ...a, _id: String(a._id) })),
    defaultAddressId: user?.defaultAddressId ? String(user.defaultAddressId) : null,
  });
}

// Add a new address (first address becomes default automatically).
export async function POST(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid address", issues: parsed.error.flatten() }, { status: 400 });
  }

  await dbConnect();
  const user = await User.findById(auth.userId).exec();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const makeDefault = user.addresses.length === 0;
  user.addresses.push({ ...parsed.data, isDefault: makeDefault });
  const added = user.addresses[user.addresses.length - 1];
  if (makeDefault) user.defaultAddressId = added._id;
  await user.save();

  return NextResponse.json({ ok: true, id: String(added._id) });
}
