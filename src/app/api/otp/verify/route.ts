import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { otpVerifySchema } from "@/lib/validate";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Verifies an OTP for the `verify`/`reset` flows (e.g. changing phone/email in
 * the profile). LOGIN by OTP goes through NextAuth signIn('otp') instead.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`otp-verify:${clientIp(req)}`, 20, 60 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const result = await verifyOtp(parsed.data.identifier.trim(), parsed.data.code, parsed.data.purpose);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
