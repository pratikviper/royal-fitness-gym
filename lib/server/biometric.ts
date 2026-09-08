import "server-only";

import { adminDb } from "./firebase-admin";

/**
 * Ingestion for eSSL / ZKTeco biometric terminals using the ADMS ("Push SDK")
 * protocol.
 *
 * The device is the client here: it makes outbound HTTP calls to the URL
 * configured in its own menu, which is why this works from a gym LAN to Vercel
 * without port forwarding. The protocol has no notion of bearer tokens — the
 * device identifies itself only by serial number — so authentication is a
 * serial allowlist plus a shared secret in the path. See app/api/iclock.
 */

/** Serial numbers permitted to post attendance, from BIOMETRIC_DEVICE_SERIALS. */
export function allowedSerials(): string[] {
  return (process.env.BIOMETRIC_DEVICE_SERIALS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * True when this serial may post. An empty allowlist rejects everything rather
 * than allowing everything — an unconfigured endpoint must not be open.
 */
export function isSerialAllowed(serial: string | null): boolean {
  if (!serial) return false;
  return allowedSerials().includes(serial.trim());
}

/** Constant-time compare so the path secret can't be probed by timing. */
export function secretMatches(provided: string | undefined): boolean {
  const expected = process.env.BIOMETRIC_INGEST_SECRET ?? "";
  if (!expected || !provided) return false;
  if (expected.length !== provided.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  return diff === 0;
}

export interface Punch {
  /** Enrolment number as stored on the device, e.g. "1", "42". */
  deviceUserId: string;
  /** Device-local wall clock, "YYYY-MM-DD HH:MM:SS". */
  timestamp: string;
  /** Device status byte: 0 check-in, 1 check-out, others are device-specific. */
  status: string;
  /** Verification mode: 1 fingerprint, 4 card, 15 face, etc. */
  verifyMode: string;
}

/**
 * Parses an ATTLOG upload body.
 *
 * The device posts tab-separated records, one per line:
 *   userId \t YYYY-MM-DD HH:MM:SS \t status \t verify \t workcode \t reserved
 *
 * Firmware varies in how many trailing columns it sends and whether it uses
 * tabs or runs of spaces, so this only requires the first two fields and
 * tolerates the rest being absent.
 */
export function parseAttlog(body: string): Punch[] {
  const punches: Punch[] = [];
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const cols = trimmed.split(/\t+|\s{2,}/).map((c) => c.trim());
    const [deviceUserId, timestamp, status = "0", verifyMode = "0"] = cols;
    if (!deviceUserId || !timestamp) continue;
    // Reject anything that isn't a plausible timestamp rather than writing junk.
    if (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(timestamp)) continue;

    punches.push({ deviceUserId, timestamp: timestamp.replace("T", " "), status, verifyMode });
  }
  return punches;
}

/** Maps device enrolment numbers to Firebase uids via users.biometricId. */
async function biometricIdToUid(): Promise<Map<string, string>> {
  const snap = await adminDb().collection("users").get();
  const map = new Map<string, string>();
  snap.forEach((d) => {
    const id = d.data().biometricId;
    if (id !== undefined && id !== null && `${id}`.trim() !== "") {
      map.set(`${id}`.trim(), d.id);
    }
  });
  return map;
}

export interface IngestResult {
  received: number;
  recorded: number;
  duplicates: number;
  unmatched: number;
}

/**
 * Records punches and folds them into the daily attendance documents the admin
 * console already reads.
 *
 * Every punch is stored under a deterministic id so a device replaying its
 * buffer (which they do on every reconnect) cannot double-count. The derived
 * attendance document keeps the earliest punch of the day as checkIn and the
 * latest as checkOut.
 */
export async function ingestPunches(serial: string, punches: Punch[]): Promise<IngestResult> {
  const db = adminDb();
  const result: IngestResult = {
    received: punches.length,
    recorded: 0,
    duplicates: 0,
    unmatched: 0,
  };
  if (punches.length === 0) return result;

  const idMap = await biometricIdToUid();

  for (const punch of punches) {
    const [date, time] = punch.timestamp.split(" ");
    const uid = idMap.get(punch.deviceUserId) ?? null;

    // Deterministic id = natural idempotency key for a replayed buffer.
    const punchId = `${serial}_${punch.deviceUserId}_${punch.timestamp}`.replace(/[^\w.-]/g, "_");
    const punchRef = db.collection("attendance_punches").doc(punchId);

    if ((await punchRef.get()).exists) {
      result.duplicates++;
      continue;
    }

    await punchRef.set({
      serial,
      deviceUserId: punch.deviceUserId,
      uid,
      date,
      time,
      timestamp: punch.timestamp,
      status: punch.status,
      verifyMode: punch.verifyMode,
      receivedAt: new Date().toISOString(),
    });
    result.recorded++;

    if (!uid) {
      // Enrolled on the device but not linked to a member yet. Kept so staff
      // can reconcile it later rather than losing the punch.
      result.unmatched++;
      continue;
    }

    // Fold into the daily record the attendance page already renders.
    const dayRef = db.collection("attendance").doc(`${uid}_${date}`);
    const existing = (await dayRef.get()).data();

    const checkIn = existing?.checkIn && existing.checkIn < time ? existing.checkIn : time;
    const checkOut = existing?.checkOut && existing.checkOut > time ? existing.checkOut : time;

    await dayRef.set(
      {
        uid,
        date,
        status: "Present",
        checkIn,
        // A single punch means they arrived; checkOut only becomes meaningful
        // once a later punch exists.
        ...(checkOut !== checkIn ? { checkOut } : {}),
        source: "biometric",
        deviceSerial: serial,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  return result;
}
