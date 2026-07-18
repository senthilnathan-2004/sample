import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { Review } from "@/models/Review";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Delete own review (only while still pending approval). Owner-scoped.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await dbConnect();
  const review = await Review.findById(params.id).exec();
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(review.userId) !== String(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (review.isApproved) {
    return NextResponse.json({ error: "Approved reviews cannot be deleted here." }, { status: 400 });
  }
  await review.deleteOne();
  return NextResponse.json({ ok: true });
}
