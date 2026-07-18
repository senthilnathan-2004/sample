import bcrypt from "bcryptjs";
import { dbConnect } from "./db";
import { Otp } from "@/models/Otp";
import { rateLimit } from "./rateLimit";

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

type Purpose = "login" | "verify" | "reset";

export type SendResult = { ok: boolean; error?: string; cooldownMs?: number };

/**
 * Generate a 6-digit OTP, store it HASHED with a short TTL, and deliver it.
 * Rate limits: 60s resend cooldown + 5/hour per identifier. When no SMS provider
 * is configured (dev), the code is logged to the SERVER console only — never
 * returned to the client.
 */
export async function sendOtp(identifier: string, purpose: Purpose): Promise<SendResult> {
  await dbConnect();

  const cooldown = rateLimit(`otp-cooldown:${identifier}`, 1, 60_000);
  if (!cooldown.ok) return { ok: false, error: "Please wait before requesting another code.", cooldownMs: cooldown.retryAfterMs };

  const hourly = rateLimit(`otp-hourly:${identifier}`, 5, 60 * 60_000);
  if (!hourly.ok) return { ok: false, error: "Too many code requests. Try again later." };

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);

  // Replace any existing codes for this identifier+purpose.
  await Otp.deleteMany({ identifier, purpose }).exec();
  await Otp.create({ identifier, purpose, codeHash, attempts: 0, expiresAt: new Date(Date.now() + TTL_MS) });

  await deliverOtp(identifier, code, purpose);
  return { ok: true };
}

/** Verify a submitted code. Consumes the OTP on success. */
export async function verifyOtp(
  identifier: string,
  code: string,
  purpose: Purpose,
): Promise<{ ok: boolean; error?: string }> {
  await dbConnect();
  const otp = await Otp.findOne({ identifier, purpose }).exec();
  if (!otp) return { ok: false, error: "Code expired or not found. Request a new one." };
  if (otp.expiresAt < new Date()) {
    await otp.deleteOne();
    return { ok: false, error: "Code expired. Request a new one." };
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    await otp.deleteOne();
    return { ok: false, error: "Too many attempts. Request a new code." };
  }

  const match = await bcrypt.compare(code, otp.codeHash);
  if (!match) {
    otp.attempts += 1;
    await otp.save();
    return { ok: false, error: "Incorrect code." };
  }

  await otp.deleteOne(); // consume
  return { ok: true };
}

/**
 * Deliver the OTP. Phase 6 wires a real SMS/email provider via lib/notify.
 * Until then (or when SMS_PROVIDER is empty), log to the server console.
 */
async function deliverOtp(identifier: string, code: string, purpose: Purpose) {
  if (!process.env.SMS_PROVIDER) {
    console.log(`\n[DEV OTP] ${purpose} code for ${identifier}: ${code}\n`);
    return;
  }
  // Route through the notifications hub (WhatsApp/email/SMS fallbacks).
  const { notify } = await import("./notify");
  await notify.sendOtpMessage(identifier, code);
}
