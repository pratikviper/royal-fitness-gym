import { getAuth } from "firebase/auth";
import app from "./firebase";

// Only initialize auth when the Firebase app is available.
// getAuth(undefined) throws a TypeError — this prevents that crash.
export const auth = app ? getAuth(app) : getAuth();