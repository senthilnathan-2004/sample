import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AdminRole } from "./rbac";
import { roleAtLeast } from "./rbac";
import { ADMIN_COOKIE, verifyAdminToken, type AdminSession } from "./adminToken";

// Server-only admin helpers (cookie reading + API guard). Edge-safe token
// primitives live in adminToken.ts (imported by middleware).
export { ADMIN_COOKIE, signAdminToken, verifyAdminToken, adminCookieOptions } from "./adminToken";
export type { AdminSession } from "./adminToken";

/** Read the admin session in a server component or route handler. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/**
 * API-route guard. Returns the admin session or a 401/403 response to return early.
 * Pass a minimum role to enforce RBAC server-side.
 */
export async function requireAdmin(
  minRole: AdminRole = "staff",
): Promise<{ session: AdminSession; response?: never } | { session?: never; response: NextResponse }> {
  const session = await getAdminSession();
  if (!session) return { response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  if (!roleAtLeast(session.role, minRole)) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}
