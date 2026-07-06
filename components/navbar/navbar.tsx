"use client";

import { cn } from "@/lib/utils";
import { mainNav } from "@/data/navigation";
import { useScrolled } from "@/hooks/use-scroll-progress";
import { Logo } from "@/components/shared/logo";
import { NavLink } from "@/components/navbar/nav-link";
import { MobileDrawer } from "@/components/navbar/mobile-drawer";
import { AnimatedButton } from "@/components/shared/animated-button";
import { useAuth } from "@/lib/auth-context";

/**
 * Sticky navbar: transparent at the top, frosted-glass + border once scrolled.
 */
export function Navbar() {
  const scrolled = useScrolled(24);
  const { user, logout } = useAuth();

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
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">
                  Hello, <span className="font-semibold text-white">{user.displayName || "Member"}</span>
                </span>
                <AnimatedButton onClick={logout} size="sm" variant="outline" magnetic={false}>
                  Logout
                </AnimatedButton>
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
