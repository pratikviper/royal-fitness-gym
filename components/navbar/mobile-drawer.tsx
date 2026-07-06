"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { mainNav } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { AnimatedButton } from "@/components/shared/animated-button";
import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/lib/auth-context";

/** Full-screen animated mobile navigation drawer. */
export function MobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-full border border-white/10 text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] lg:hidden"
          >
            <div className="absolute inset-0 glass-strong" />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-ink-soft p-6"
            >
              <div className="flex items-center justify-between">
                <Logo compact />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="grid size-11 place-items-center rounded-full border border-white/10"
                >
                  <X className="size-5" />
                </button>
              </div>

              {user && (
                <div className="mt-6 border-b border-white/5 pb-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Hello, <span className="font-semibold text-white">{user.displayName || "Member"}</span>
                  </p>
                </div>
              )}

              <ul className="mt-8 flex flex-col gap-2">
                {mainNav.map((item, i) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block border-b border-white/5 py-4 font-heading text-3xl tracking-wide transition-colors",
                          active ? "text-royal" : "text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-auto space-y-3">
                {user ? (
                  <AnimatedButton
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    variant="outline"
                    className="w-full"
                    magnetic={false}
                  >
                    Logout
                  </AnimatedButton>
                ) : (
                  <>
                    <AnimatedButton
                      href="/login"
                      onClick={() => setOpen(false)}
                      variant="ghost"
                      className="w-full"
                      magnetic={false}
                    >
                      Login
                    </AnimatedButton>
                    <AnimatedButton
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="w-full"
                      magnetic={false}
                    >
                      Join Now
                    </AnimatedButton>
                  </>
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
