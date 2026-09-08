import "server-only";

import { NextResponse } from "next/server";
import { adminAuth, adminDb, isAdminSdkConfigured } from "./firebase-admin";
import { ADMIN_EMAIL } from "@/lib/admin";

/**
 * Authorises a request as an administrator.
 *
 * The Admin SDK ignores Firestore security rules, so this function IS the
 * access-control boundary for every route that uses it. It mirrors `isAdmin()`
 * in firestore.rules: the bootstrap address matched exactly, or `role: "admin"`
 * on the caller's own user document.
 *
 * Returns the caller's uid on success, or a ready-to-return error response.
 */
export type AdminAuthResult =
  | { ok: true; uid: string; email: string | null }
  | { ok: false; response: NextResponse };

function fail(status: number, error: string): AdminAuthResult {
  return { ok: false, response: NextResponse.json({ error }, { status }) };
}

export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  if (!isAdminSdkConfigured()) {
    return fail(
      503,
      "Server-side member management is not configured. Set FIREBASE_SERVICE_ACCOUNT."
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return fail(401, "Missing bearer token.");
  }

  let decoded;
  try {
    // checkRevoked: a disabled or signed-out account must stop working
    // immediately, not when its hour-long ID token happens to expire.
    decoded = await adminAuth().verifyIdToken(token, true);
  } catch {
    return fail(401, "Invalid or expired session. Please sign in again.");
  }

  const email = decoded.email ?? null;
  if (email && email.toLowerCase() === ADMIN_EMAIL) {
    return { ok: true, uid: decoded.uid, email };
  }

  // Otherwise the role must be on the caller's own user document.
  try {
    const snap = await adminDb().collection("users").doc(decoded.uid).get();
    const data = snap.data();
    if (data?.role === "admin" && data?.deleted !== true) {
      return { ok: true, uid: decoded.uid, email };
    }
  } catch {
    return fail(500, "Could not verify administrator role.");
  }

  return fail(403, "Administrator access required.");
}
