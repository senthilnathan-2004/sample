import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { requireUserId } from "@/lib/ownership";
import { addressSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

// Update an address, or set it as default (?action=default). Owner-scoped.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  await dbConnect();
  const user = await User.findById(auth.userId).exec();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const addr = user.addresses.id(params.id);
  if (!addr) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  const setDefault = new URL(req.url).searchParams.get("action") === "default";
  if (setDefault) {
    user.addresses.forEach((a) => (a.isDefault = String(a._id) === params.id));
    user.defaultAddressId = addr._id;
    await user.save();
    return NextResponse.json({ ok: true });
  }

  const body = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  addr.set(parsed.data);
  await user.save();
  return NextResponse.json({ ok: true });
}

// Delete an address (reassigns default if needed). Owner-scoped.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  await dbConnect();
  const user = await User.findById(auth.userId).exec();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const addr = user.addresses.id(params.id);
  if (!addr) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  const wasDefault = String(user.defaultAddressId) === params.id;
  addr.deleteOne();
  if (wasDefault && user.addresses.length) {
    user.addresses[0].isDefault = true;
    user.defaultAddressId = user.addresses[0]._id;
  } else if (!user.addresses.length) {
    user.defaultAddressId = undefined;
  }
  await user.save();
  return NextResponse.json({ ok: true });
}
