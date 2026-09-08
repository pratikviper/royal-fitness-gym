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

  // Firebase Auth is the authoritative list of accounts, NOT the `users`
  // collection: an account whose profile document was never created (a failed
  // signup, or a record removed by an older delete path) still has a working
  // login while being invisible in Firestore. Enumerating documents alone
  // silently skips exactly the accounts most in need of cleaning up.
  const profiles = new Map<string, FirebaseFirestore.DocumentData>();
  const usersSnap = await db.collection("users").get();
  usersSnap.forEach((d) => profiles.set(d.id, d.data()));

  const targets = new Set<string>();

  // 1. Every Auth account that is not an admin and not the caller.
  let pageToken: string | undefined;
  do {
    const page = await adminAuth().listUsers(1000, pageToken);
    for (const user of page.users) {
      if (user.uid === auth.uid) continue;
      // Judge admin status on the profile when there is one, and on the email
      // claim when there isn't — otherwise an admin missing a document, or the
      // bootstrap address itself, would be swept up.
      const profile = profiles.get(user.uid);
      if (isAdminRecord({ email: user.email ?? null, role: profile?.role ?? null })) continue;
      targets.add(user.uid);
    }
    pageToken = page.pageToken;
  } while (pageToken);

  // 2. Profile documents with no Auth account behind them — nothing to revoke,
  //    but the records still need clearing.
  for (const [uid, data] of profiles) {
    if (uid === auth.uid) continue;
    if (isAdminRecord(data)) continue;
    targets.add(uid);
  }

  const targetIds = [...targets];
  if (targetIds.length === 0) {
    return NextResponse.json({ deleted: 0, failed: [] });
  }

  // 3. Revoke logins. deleteUsers handles up to 1000 uids per call and reports
  //    per-uid failures instead of throwing for the whole set.
  const failed: string[] = [];
  for (let i = 0; i < targetIds.length; i += 1000) {
    const chunk = targetIds.slice(i, i + 1000);
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

  const removable = targetIds.filter((uid) => !failed.includes(uid));

  // 4. Delete their records.
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
