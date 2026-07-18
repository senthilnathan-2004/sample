import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/otp";
import { otpSendSchema } from "@/lib/validate";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Sends an OTP (SMS in prod; dev console fallback). Rate limits enforced in lib/otp.
export async function POST(req: Request) {
  const rl = rateLimit(`otp-send:${clientIp(req)}`, 10, 60 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = otpSendSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // For login/verify by phone, require a 10-digit number.
  const id = parsed.data.identifier.trim();
  if (!/^\d{10}$/.test(id) && !/^[^@]+@[^@]+$/.test(id)) {
    return NextResponse.json({ error: "Enter a valid 10-digit phone number." }, { status: 400 });
  }

  const result = await sendOtp(id, parsed.data.purpose);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 429 });

  // Never return the code. Signal dev mode so the UI can hint where to find it.
  return NextResponse.json({ ok: true, devMode: !process.env.SMS_PROVIDER });
}
