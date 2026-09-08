"use client";

import { auth } from "@/lib/auth";

/**
 * Client for the authenticated /api/admin routes.
 *
 * Sends the caller's Firebase ID token as a bearer credential; the server
 * verifies it and re-checks admin rights before touching the Admin SDK.
 */

export interface CreateMemberPayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  age?: number;
  joiningDate?: string;
  heightCm?: number;
  weightKg?: number;
  membership?: {
    planId: string;
    planName: string;
    startDate: string;
    endDate: string;
    durationMonths: number;
    pricePaid: number;
  };
}

export interface CreateMemberResult {
  uid: string;
  email: string;
  /** One-time link the member uses to set their own password. */
  passwordResetLink: string | null;
}

/** Thrown with the server's message so callers can show it directly. */
export class AdminApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

async function authorizedFetch(path: string, init: RequestInit = {}) {
  const current = auth.currentUser;
  if (!current) {
    throw new AdminApiError("Your session has expired. Please sign in again.", 401);
  }

  const token = await current.getIdToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  let payload: Record<string, unknown> = {};
  try {
    payload = await response.json();
  } catch {
    // Non-JSON response (a proxy error page, say) — fall back to the status.
  }

  if (!response.ok) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : `Request failed (${response.status}).`;
    throw new AdminApiError(message, response.status);
  }

  return payload;
}

/** Creates a Firebase Auth account plus the member's Firestore records. */
export async function createMemberAccount(
  payload: CreateMemberPayload
): Promise<CreateMemberResult> {
  const data = await authorizedFetch("/api/admin/members", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data as unknown as CreateMemberResult;
}

/** Permanently deletes a member's account and records. */
export async function deleteMemberAccount(uid: string): Promise<void> {
  await authorizedFetch(`/api/admin/members/${encodeURIComponent(uid)}`, {
    method: "DELETE",
  });
}

/** Deletes every non-admin member. Irreversible. */
export async function purgeAllMemberAccounts(): Promise<{
  deleted: number;
  failed: string[];
}> {
  const data = await authorizedFetch("/api/admin/members/purge", {
    method: "POST",
    body: JSON.stringify({ confirm: "PURGE ALL MEMBERS" }),
  });
  return data as unknown as { deleted: number; failed: string[] };
}
