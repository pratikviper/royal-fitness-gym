import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/server/firebase-admin";
import { requireAdmin } from "@/lib/server/require-admin";
import { isAdminRecord } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Firestore caps a batch at 500 writes. */
const BATCH_LIMIT = 450;

/**
 * Deletes every non-admin member — Auth accounts and records alike.
 *
 * Destructive and irreversible, so it requires an explicit confirmation string
 * in the body rather than firing on an empty POST.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: { confirm?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (body.confirm !== "PURGE ALL MEMBERS") {
    return NextResponse.json(
      { error: "Confirmation phrase missing or incorrect." },
      { status: 400 }
    );
  }

  const db = adminDb();

  // Collect the members to remove — never an admin, never the caller.
  const usersSnap = await db.collection("users").get();
  const targets: string[] = [];
  usersSnap.forEach((docSnap) => {
    if (docSnap.id === auth.uid) return;
    if (isAdminRecord(docSnap.data())) return;
    targets.push(docSnap.id);
  });

  if (targets.length === 0) {
    return NextResponse.json({ deleted: 0, failed: [] });
  }

  // 1. Revoke logins. deleteUsers handles up to 1000 uids per call and reports
  //    per-uid failures instead of throwing for the whole set.
  const failed: string[] = [];
  for (let i = 0; i < targets.length; i += 1000) {
    const chunk = targets.slice(i, i + 1000);
    try {
      const result = await adminAuth().deleteUsers(chunk);
      for (const err of result.errors) {
        // "user-not-found" just means there was no Auth account behind the
        // document — the record still needs cleaning up, so don't count it.
        if (err.error.code !== "auth/user-not-found") {
          failed.push(chunk[err.index]);
        }
      }
    } catch (e) {
      console.error("[admin/members/purge] deleteUsers failed for a chunk:", e);
      failed.push(...chunk);
    }
  }

  const removable = targets.filter((uid) => !failed.includes(uid));

  // 2. Delete their records.
  try {
    const refs = [];
    for (const uid of removable) {
      refs.push(db.collection("users").doc(uid));
      refs.push(db.collection("memberships").doc(uid));
      refs.push(db.collection("bmi").doc(uid));
    }
    for (const collection of ["bmi_reports", "payments", "attendance"]) {
      const snap = await db.collection(collection).get();
      snap.forEach((d) => {
        const owner = d.data().uid;
        if (typeof owner === "string" && removable.includes(owner)) refs.push(d.ref);
      });
    }

    for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
      const batch = db.batch();
      for (const ref of refs.slice(i, i + BATCH_LIMIT)) batch.delete(ref);
      await batch.commit();
    }
  } catch (e) {
    console.error("[admin/members/purge] Record cleanup failed:", e);
    return NextResponse.json(
      {
        error: "Logins were revoked but some records remain. Please run the purge again.",
        deleted: removable.length,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ deleted: removable.length, failed });
}
