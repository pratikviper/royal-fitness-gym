import { NextResponse } from "next/server";
import { FirebaseError } from "firebase-admin";
import { adminAuth, adminDb } from "@/lib/server/firebase-admin";
import { requireAdmin } from "@/lib/server/require-admin";

/** Never prerender or cache — every call is an authorised mutation. */
export const dynamic = "force-dynamic";

interface CreateMemberBody {
  fullName?: string;
  email?: string;
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

const generateMembershipId = () => `RF-${Math.floor(10000 + Math.random() * 90000)}`;

/** A first password the member replaces via the normal reset flow. */
const generateTempPassword = () =>
  `Rf${Math.random().toString(36).slice(2, 10)}${Math.floor(10 + Math.random() * 89)}!`;

/**
 * Creates a real member: a Firebase Auth account plus the matching Firestore
 * documents, keyed by the same uid.
 *
 * This is the whole reason the route exists — the client SDK cannot create an
 * account for someone else (calling createUserWithEmailAndPassword in the admin
 * console would sign the admin out and swap the session to the new user), so
 * staff-entered members previously got a fake `pending_...` id and could never
 * log in.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: CreateMemberBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const fullName = body.fullName?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const tempPassword = generateTempPassword();

  let uid: string;
  try {
    // The phone number is deliberately NOT passed to createUser.
    //
    // A phone number given to Firebase Auth becomes a sign-in identifier, and
    // those are globally unique — the second member registered on a number
    // would be rejected with auth/phone-number-already-exists. Households share
    // a number all the time (a parent enrolling children, a couple on one
    // handset), so the number is stored on the Firestore profile instead, where
    // no uniqueness constraint applies and any number of members may share it.
    //
    // Members created here sign in with their email and the password they set
    // via the setup link. Phone-OTP sign-in remains one account per number,
    // which is a Firebase invariant rather than a choice made here.
    const created = await adminAuth().createUser({
      email,
      password: tempPassword,
      displayName: fullName,
    });
    uid = created.uid;
  } catch (e) {
    const code = (e as FirebaseError)?.code ?? "";
    if (code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error("[admin/members] createUser failed:", e);
    return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
  }

  // From here on the Auth account exists; if the Firestore writes fail we roll
  // it back so a retry isn't blocked by "email already exists".
  try {
    const db = adminDb();
    const joiningDate = body.joiningDate || new Date().toISOString().split("T")[0];

    const batch = db.batch();

    batch.set(db.collection("users").doc(uid), {
      uid,
      fullName,
      email,
      phoneNumber: body.phoneNumber?.trim() ?? "",
      joiningDate,
      membershipId: generateMembershipId(),
      photoURL: null,
      role: "member",
      status: "Active",
      deleted: false,
      ...(body.gender ? { gender: body.gender } : {}),
      ...(typeof body.age === "number" ? { age: body.age } : {}),
      ...(typeof body.heightCm === "number" && body.heightCm > 0
        ? { heightCm: body.heightCm }
        : {}),
      ...(typeof body.weightKg === "number" && body.weightKg > 0
        ? { weightKg: body.weightKg }
        : {}),
    });

    if (body.membership) {
      batch.set(db.collection("memberships").doc(uid), {
        ...body.membership,
        status: "Active",
      });
    }

    await batch.commit();
  } catch (e) {
    console.error("[admin/members] Firestore write failed, rolling back account:", e);
    try {
      await adminAuth().deleteUser(uid);
    } catch (rollbackError) {
      // Surfaced so an orphaned Auth account can be cleaned up by hand.
      console.error("[admin/members] Rollback failed, orphaned uid:", uid, rollbackError);
    }
    return NextResponse.json(
      { error: "Could not save the member record. No account was created." },
      { status: 500 }
    );
  }

  // A one-time link is safer than returning the temporary password: it is
  // delivered to the member's own inbox rather than shown on the admin's screen.
  let passwordResetLink: string | null = null;
  try {
    passwordResetLink = await adminAuth().generatePasswordResetLink(email);
  } catch (e) {
    console.warn("[admin/members] Could not generate password reset link:", e);
  }

  return NextResponse.json({ uid, email, passwordResetLink }, { status: 201 });
}
