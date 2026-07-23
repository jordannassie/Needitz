/**
 * Admin authentication — PIN-based, server-side only.
 *
 * SECURITY NOTE: This is an MVP-grade PIN check suitable for low-stakes
 * internal tooling. Before using this in a high-value production environment:
 *   1. Move the PIN to an environment variable (ADMIN_PIN).
 *   2. Replace the cookie with a proper signed JWT or session store.
 *   3. Add brute-force lockout beyond the existing rate limit.
 *
 * The PIN is validated server-side only. The session token stored in the
 * httpOnly cookie is never the raw PIN — it is an opaque derived value.
 */
import { cookies } from "next/headers";

// ─── PIN ────────────────────────────────────────────────────────────────────
// TODO: Move to process.env.ADMIN_PIN before launch
const ADMIN_PIN = "1234";

// Opaque session marker — never sent to the client; only validated server-side
const SESSION_MARKER = "needitz_session_v1_authenticated";
const COOKIE_NAME = "needitz_admin";

export function isPinValid(pin: string): boolean {
  return pin === ADMIN_PIN;
}

export function buildSessionCookieValue(): string {
  return Buffer.from(SESSION_MARKER).toString("base64url");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;
  try {
    return Buffer.from(value, "base64url").toString("utf-8") === SESSION_MARKER;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
