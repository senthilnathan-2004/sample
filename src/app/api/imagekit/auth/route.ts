import { NextResponse } from "next/server";
import { getImageKit, imagekitConfigured } from "@/lib/imagekit";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Signed upload auth for the admin ImageUploader. Admin-only.
export async function GET() {
  const auth = await requireAdmin("manager");
  if (auth.response) return auth.response;

  if (!imagekitConfigured()) {
    return NextResponse.json({ error: "ImageKit not configured" }, { status: 503 });
  }

  const params = getImageKit().getAuthenticationParameters();
  return NextResponse.json({
    ...params,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}
