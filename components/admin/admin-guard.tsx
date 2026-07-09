"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, ShieldAlert } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Redirect to login, capturing current path for redirect after login
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const checkAdmin = async () => {
      setLoading(true);
      
      // Auto-grant access to admin emails as safety fallback
      const isDefaultAdminEmail = !!(
        user.email?.toLowerCase() === "admin@royalfitness.com" || 
        user.email?.toLowerCase().includes("admin")
      );

      if (db) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            const hasAdminRole = data.role === "admin" || isDefaultAdminEmail;
            setIsAdmin(hasAdminRole);
          } else {
            // New user without document yet, check default email
            setIsAdmin(isDefaultAdminEmail);
          }
        } catch (e) {
          console.warn("Firestore error checking admin role, falling back to email config:", e);
          setIsAdmin(isDefaultAdminEmail);
        }
      } else {
        // LocalStorage fallback for mock mode
        const cached = localStorage.getItem(`rf_profile_${user.uid}`);
        if (cached) {
          try {
            const details = JSON.parse(cached);
            setIsAdmin(details.role === "admin" || isDefaultAdminEmail);
          } catch {
            setIsAdmin(isDefaultAdminEmail);
          }
        } else {
          setIsAdmin(isDefaultAdminEmail);
        }
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user, authLoading, router, pathname]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-ink text-white">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-ink text-white p-6">
        <div className="rounded-full border border-royal/20 bg-royal/5 p-5 text-royal animate-pulse">
          <ShieldAlert className="size-12" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h1 className="font-heading text-3xl font-bold tracking-wider text-steel">Access Restricted</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This dashboard is reserved for gym administration personnel. Your current account details do not possess the required credentials.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push("/")}
            className="px-6 h-11 rounded-full border border-white/10 hover:border-white/20 text-xs font-heading font-semibold uppercase tracking-wider transition-all"
          >
            Back to Site
          </button>
          <button 
            onClick={() => router.push("/login")}
            className="px-6 h-11 rounded-full bg-royal hover:bg-royal-light text-xs font-heading font-semibold uppercase tracking-wider transition-all hover:shadow-glow text-white"
          >
            Log In as Admin
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
