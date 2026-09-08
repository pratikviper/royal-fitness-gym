import { NextResponse } from "next/server";
import { FirebaseError } from "firebase-admin";
import { adminAuth, adminDb } from "@/lib/server/firebase-admin";
import { requireAdmin } from "@/lib/server/require-admin";
import { isAdminRecord } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Permanently removes a member: the Firebase Auth account first, then the
 * Firestore records.
 *
 * Deleting only the documents (what the console used to do) left the login
 * working, and the next sign-in re-seeded a fresh profile — so "deleted"
 * members reappeared. Revoking the credential is the part that requires the
 * Admin SDK and therefore this route.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { uid } = await params;
  if (!uid) {
    return NextResponse.json({ error: "Member id is required." }, { status: 400 });
  }

  if (uid === auth.uid) {
    return NextResponse.json(
      { error: "You cannot delete the account you are signed in with." },
      { status: 400 }
    );
  }

  const db = adminDb();

  // Refuse to delete another administrator through the member console.
  const userSnap = await db.collection("users").doc(uid).get();
  if (userSnap.exists && isAdminRecord(userSnap.data())) {
    return NextResponse.json(
      { error: "This account is an administrator and cannot be removed here." },
      { status: 403 }
    );
  }

  // 1. Revoke access first. If the account is already gone from Auth (a
  //    document left behind by the old delete path), carry on and clean up.
  try {
    await adminAuth().deleteUser(uid);
  } catch (e) {
    const code = (e as FirebaseError)?.code ?? "";
    if (code !== "auth/user-not-found") {
      console.error("[admin/members] deleteUser failed:", e);
      return NextResponse.json(
        { error: "Could not revoke the member's login." },
        { status: 500 }
      );
    }
  }

  // 2. Remove their records. Collections keyed by uid delete directly;
  //    the rest are queried by their `uid` field.
  try {
    const batch = db.batch();
    batch.delete(db.collection("users").doc(uid));
    batch.delete(db.collection("memberships").doc(uid));
    batch.delete(db.collection("bmi").doc(uid));

    for (const collection of ["bmi_reports", "payments", "attendance"]) {
      const owned = await db.collection(collection).where("uid", "==", uid).get();
      owned.forEach((d) => batch.delete(d.ref));
    }

    await batch.commit();
  } catch (e) {
    // The login is already revoked, so the member cannot get back in even if
    // this half failed — report it rather than claiming a clean delete.
    console.error("[admin/members] Record cleanup failed after deleting account:", e);
    return NextResponse.json(
      {
        error:
          "The login was revoked but some records could not be removed. Please retry.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ uid, deleted: true });
}
