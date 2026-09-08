"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail, isAdminRecord, isDeactivated } from "@/lib/admin";

/**
 * Resolves whether the signed-in user is an administrator.
 *
 * Purely for deciding what the UI offers — Firestore rules are the enforcement
 * boundary. Returns false while loading and for signed-out visitors.
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;
    const bootstrapAdmin = isAdminEmail(user.email);

    const resolve = async () => {
      if (db) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          const data = snap.exists() ? snap.data() : null;
          if (cancelled) return;
          setIsAdmin(data ? !isDeactivated(data) && isAdminRecord(data) : bootstrapAdmin);
          return;
        } catch {
          // Fall through to the local cache below.
        }
      }

      const cached = localStorage.getItem(`rf_profile_${user.uid}`);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (cancelled) return;
          setIsAdmin(!isDeactivated(data) && isAdminRecord(data));
          return;
        } catch {
          // Ignore malformed cache.
        }
      }
      if (!cancelled) setIsAdmin(bootstrapAdmin);
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return isAdmin;
}
