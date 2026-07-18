import { SignJWT, jwtVerify } from "jose";
import type { AdminRole } from "./rbac";

/**
 * Edge-safe admin token primitives — NO next/headers or next/server imports, so
 * this can be imported from middleware.ts (Edge runtime). Cookie reading and the
 * API guard live in adminAuth.ts (server-only).
 */
export const ADMIN_COOKIE = "lp_admin";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export type AdminSession = { adminId: string; role: AdminRole; name: string };

function secret(): Uint8Array {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is required for admin auth.");
  return new TextEncoder().encode(s);
}

export async function signAdminToken(session: AdminSession): Promise<string> {
  return new SignJWT({ role: session.role, name: session.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.adminId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      adminId: String(payload.sub),
      role: payload.role as AdminRole,
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}
