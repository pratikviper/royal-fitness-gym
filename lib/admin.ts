/**
 * Single source of truth for "who is an admin".
 *
 * This must stay in lockstep with `isAdmin()` in firestore.rules — the rules are
 * the real enforcement boundary, this module only decides what the UI renders.
 * Never widen these checks (e.g. `email.includes("admin")`): anyone can pick
 * their own signup email, so a substring match hands the console to strangers.
 */

/** The bootstrap admin address. Must match ADMIN_EMAIL in firestore.rules. */
export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase() ||
  "admin@royalfitness.com";

/** Fields the client is never allowed to set on its own user document. */
export const PRIVILEGED_USER_FIELDS = ["role", "status", "deleted", "deletedAt"] as const;

/** Shape of the user-document fields these helpers care about. */
export interface UserRecordFlags {
  email?: string | null;
  role?: string | null;
  status?: string | null;
  deleted?: boolean | null;
}

/** Exact-match check against the bootstrap admin address. */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

/** True when a user document represents an administrator. */
export function isAdminRecord(data?: UserRecordFlags | null): boolean {
  if (!data) return false;
  return data.role === "admin" || isAdminEmail(data.email);
}

/** True when an account has been deactivated by an admin (soft delete). */
export function isDeactivated(data?: UserRecordFlags | null): boolean {
  if (!data) return false;
  return data.deleted === true || data.status === "Deleted";
}

/**
 * True when a user document should appear in admin member lists — i.e. a live
 * member, not an admin and not a deactivated tombstone.
 */
export function isListableMember(data?: UserRecordFlags | null): boolean {
  if (!data) return false;
  return !isAdminRecord(data) && !isDeactivated(data);
}

/** Strips privileged fields from a payload before it is written by the client. */
export function stripPrivilegedFields<T extends Record<string, unknown>>(
  payload: T
): Omit<T, (typeof PRIVILEGED_USER_FIELDS)[number]> {
  const clone = { ...payload } as Record<string, unknown>;
  for (const field of PRIVILEGED_USER_FIELDS) delete clone[field];
  return clone as Omit<T, (typeof PRIVILEGED_USER_FIELDS)[number]>;
}
