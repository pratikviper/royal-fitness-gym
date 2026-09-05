"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { mainNav } from "@/data/navigation";
import { useScrolled } from "@/hooks/use-scroll-progress";
import { Logo } from "@/components/shared/logo";
import { NavLink } from "@/components/navbar/nav-link";
import { MobileDrawer } from "@/components/navbar/mobile-drawer";
import { AnimatedButton } from "@/components/shared/animated-button";
import { useAuth } from "@/lib/auth-context";
import { getProfileDetails } from "@/lib/profile-db";
import { Avatar } from "@/components/shared/avatar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Sticky navbar: transparent at the top, frosted-glass + border once scrolled.
 */
export function Navbar() {
  const scrolled = useScrolled(24);
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("Member");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    setDisplayName(user.displayName || "Member");

    const loadProfile = async () => {
      try {
        const details = await getProfileDetails(user.uid, user.email, user.displayName);
        setDisplayName(details.fullName);
        setPhotoURL(details.photoURL || null);
      } catch (err) {
        console.warn("Failed to load profile for navbar:", err);
      }
    };
    loadProfile();

    // Determine admin role
    const checkAdmin = async () => {
      const isAdminEmail = !!(
        user.email?.toLowerCase() === "admin@royalfitness.com" ||
        user.email?.toLowerCase().includes("admin")
      );
      if (db) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          const role = snap.exists() ? snap.data()?.role : null;
          setIsAdmin(role === "admin" || isAdminEmail);
          return;
        } catch { /* fall through */ }
      }
      // localStorage fallback
      const cached = localStorage.getItem(`rf_profile_${user.uid}`);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setIsAdmin(data.role === "admin" || isAdminEmail);
          return;
        } catch { /* ignore */ }
      }
      setIsAdmin(isAdminEmail);
    };
    checkAdmin();

    const handleStorageChange = () => { loadProfile(); };
    window.addEventListener("storage", handleStorageChange);
    return () => { window.removeEventListener("storage", handleStorageChange); };
  }, [user]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "glass-strong border-b border-white/10 py-3"
          : "border-b border-transparent py-5",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 lg:flex"
        >
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Mobile Profile Avatar — goes to /admin for admins */}
          {user && (
            <Link
              href={isAdmin ? "/admin" : "/profile"}
              className="lg:hidden transition-all duration-300 hover:scale-105 active:scale-95"
              title={isAdmin ? "Admin Dashboard" : "View Profile"}
            >
              <Avatar size="sm" src={photoURL} name={displayName} className="hover:border-royal hover:shadow-[0_0_8px_rgba(225,29,58,0.2)]" />
            </Link>
          )}

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">
                  Hello, <span className="font-semibold text-white">{displayName}</span>
                </span>
                <Link
                  href={isAdmin ? "/admin" : "/profile"}
                  className="transition-all duration-300 hover:scale-105"
                  title={isAdmin ? "Admin Dashboard" : "View Profile"}
                >
                  <Avatar size="md" src={photoURL} name={displayName} className="hover:border-royal hover:shadow-[0_0_12px_rgba(225,29,58,0.3)]" />
                </Link>
              </>
            ) : (
              <>
                <AnimatedButton href="/login" size="sm" variant="ghost" magnetic={false}>
                  Login
                </AnimatedButton>
                <AnimatedButton href="/signup" size="sm" magnetic={false}>
                  Join Now
                </AnimatedButton>
              </>
            )}
          </div>
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}
