import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Server-side Firebase Admin SDK.
 *
 * The Admin SDK bypasses Firestore security rules entirely — it authenticates
 * as the project, not as a user. Every route that touches it MUST authorise the
 * caller itself first (see requireAdmin in ./require-admin.ts).
 *
 * The `server-only` import above makes the build fail loudly if any of this is
 * ever pulled into a client component, which would leak the service account.
 */

const ADMIN_APP_NAME = "royal-fitness-admin";

/**
 * Reads the service account from the environment.
 *
 * Accepts either raw JSON or base64 — base64 is easier to paste into hosts that
 * mangle newlines in env vars (the private key is multi-line).
 */
function readServiceAccount(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;

  let json = raw.trim();
  if (!json.startsWith("{")) {
    try {
      json = Buffer.from(json, "base64").toString("utf8");
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT is neither JSON nor valid base64.");
    }
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT could not be parsed as JSON.");
  }

  const projectId = parsed.project_id ?? parsed.projectId;
  const clientEmail = parsed.client_email ?? parsed.clientEmail;
  const privateKey = parsed.private_key ?? parsed.privateKey;

  if (
    typeof projectId !== "string" ||
    typeof clientEmail !== "string" ||
    typeof privateKey !== "string"
  ) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is missing project_id, client_email or private_key."
    );
  }

  return {
    projectId,
    clientEmail,
    // Hosts that store env vars as single-line strings turn real newlines into
    // the two characters \ and n; the PEM parser needs them back.
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

/** True when the server has credentials — lets routes 503 with a clear message. */
export function isAdminSdkConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT;
}

function getAdminApp(): App {
  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME);
  if (existing) return existing;

  const serviceAccount = readServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not set — server-side member management is disabled."
    );
  }

  return initializeApp(
    {
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    },
    ADMIN_APP_NAME
  );
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export { getApp };
