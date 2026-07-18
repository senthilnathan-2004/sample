import { NextResponse } from "next/server";
import { getSessionUserId } from "./auth";

/**
 * Account-API guard. Returns the session user id, or a 401 response to return
 * early. Every /api/account/* handler starts by loading the user's OWN resources
 * scoped to this id — cross-user access is never possible because queries filter
 * by it. For nested resources, also assertOwner() before mutating.
 */
export async function requireUserId(): Promise<
  { userId: string; response?: never } | { userId?: never; response: NextResponse }
> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  return { userId };
}

/** Throw-style ownership check for resources that carry their own userId. */
export function assertOwner(resourceUserId: string | null | undefined, sessionUserId: string): boolean {
  return !!resourceUserId && String(resourceUserId) === String(sessionUserId);
}
