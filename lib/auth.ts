import { getAuth, type Auth } from "firebase/auth";
import app from "./firebase";

export const auth: Auth | null = app ? getAuth(app) : null;