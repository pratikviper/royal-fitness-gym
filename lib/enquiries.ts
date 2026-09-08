import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

/** A contact-form submission as stored in `contact_enquiries`. */
export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest?: string;
  message: string;
  date: string;
  status: "Pending" | "Replied";
  reply: string;
}

export interface ContactEnquiryInput {
  name: string;
  email: string;
  phone: string;
  interest?: string;
  message: string;
}

const isBrowser = typeof window !== "undefined";

/** Appends to the localStorage mirror used when Firebase is not configured. */
function saveLocalEnquiry(enquiry: ContactEnquiry) {
  if (!isBrowser) return;
  try {
    const existing = JSON.parse(localStorage.getItem("rf_enquiries") || "[]");
    existing.push(enquiry);
    localStorage.setItem("rf_enquiries", JSON.stringify(existing));
  } catch {
    localStorage.setItem("rf_enquiries", JSON.stringify([enquiry]));
  }
}

/**
 * Records a contact-form submission.
 *
 * Writes to `contact_enquiries`, which the rules open to unauthenticated
 * creates (the form is public) but keep readable by admins only. `status` and
 * `reply` are fixed here because the rules reject a caller-chosen status.
 *
 * Throws on failure so the form can report the problem instead of showing a
 * false "Message Sent".
 */
export async function submitContactEnquiry(input: ContactEnquiryInput): Promise<void> {
  const enquiry: ContactEnquiry = {
    id: "",
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    // Omitted entirely when absent — Firestore rejects an explicit `undefined`.
    ...(input.interest ? { interest: input.interest } : {}),
    message: input.message.trim(),
    date: new Date().toISOString().split("T")[0],
    status: "Pending",
    reply: "",
  };

  if (db) {
    const ref = doc(collection(db, "contact_enquiries"));
    // `id` is the document key, not a stored field — the rules reject unknown keys.
    const { id: _id, ...payload } = enquiry;
    await setDoc(ref, payload);
    return;
  }

  saveLocalEnquiry({ ...enquiry, id: `enq_local_${Date.now()}` });
}

/**
 * Records a newsletter opt-in. Same public-create / admin-read shape as
 * enquiries; the email is the document id so re-subscribing is idempotent.
 */
export async function subscribeToNewsletter(email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  const payload = { email: trimmed, date: new Date().toISOString().split("T")[0] };

  if (db) {
    // Document ids may not contain "/" — encode the address to be safe.
    await setDoc(doc(db, "newsletter_subscribers", encodeURIComponent(trimmed)), payload);
    return;
  }

  if (isBrowser) {
    try {
      const existing = JSON.parse(localStorage.getItem("rf_newsletter") || "[]");
      if (!existing.includes(trimmed)) existing.push(trimmed);
      localStorage.setItem("rf_newsletter", JSON.stringify(existing));
    } catch {
      localStorage.setItem("rf_newsletter", JSON.stringify([trimmed]));
    }
  }
}
