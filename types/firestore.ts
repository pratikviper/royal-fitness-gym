/**
 * Shapes of the documents stored in Firestore.
 *
 * `doc.data()` returns an untyped `DocumentData`, so these interfaces are an
 * assertion about what the app writes into each collection — cast at the read
 * boundary (`doc.data() as UserRecord`), the way the rest of the admin code
 * already does. Fields marked optional are ones the app genuinely may not
 * write; the rest are always present on records this app created.
 */

import type {
  UserProfileDetails,
  UserMembership,
  UserBmiDetails,
} from "@/lib/profile-db";

/** A document in `users`, keyed by Firebase Auth uid. */
export interface UserRecord extends UserProfileDetails {
  /** Set when staff assign a personal trainer. */
  trainerId?: string;
}

/** A document in `memberships`, keyed by uid. */
export type MembershipRecord = UserMembership;

/** A document in `bmi`, keyed by uid. */
export type BmiRecord = UserBmiDetails;

/** An append-only entry in `bmi_reports`. */
export interface BmiReportRecord extends UserBmiDetails {
  uid: string;
}

/** A document in `payments`, keyed by invoice number. */
export interface PaymentRecord {
  uid: string;
  invoiceNo: string;
  planName: string;
  amount: number;
  method: string;
  status: "Paid" | "Pending" | "Failed";
  date: string;
}

/** A document in `attendance`, keyed by `${uid}_${date}`. */
export interface AttendanceRecord {
  uid: string;
  date: string;
  status: "Present" | "Absent";
  checkIn?: string;
  checkOut?: string;
  /** How the record was created; absent on older manually-marked rows. */
  source?: "biometric" | "manual";
  /** Serial of the terminal that produced it, when source is "biometric". */
  deviceSerial?: string;
}

/** A raw punch from a biometric terminal, before it is folded into a day. */
export interface AttendancePunchRecord {
  serial: string;
  deviceUserId: string;
  /** null when the enrolment number isn't linked to a member yet. */
  uid: string | null;
  date: string;
  time: string;
  timestamp: string;
  status: string;
  verifyMode: string;
  receivedAt: string;
}

/** A document in `trainers`. */
export interface TrainerRecord {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
}

/** A document in `plans_models`. */
export interface PlanRecord {
  id: string;
  name: string;
  price: number;
  duration: string;
  status: "Active" | "Inactive";
  features: string;
}
