import { NextResponse } from "next/server";
import { getBuyAgain } from "@/lib/account";
import { requireUserId } from "@/lib/ownership";

export const dynamic = "force-dynamic";

// Buy-again products for the logged-in user (used by the home rail).
export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;
  const items = await getBuyAgain();
  return NextResponse.json({ items });
}
