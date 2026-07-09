"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Award, 
  CreditCard, 
  Calendar, 
  Activity, 
  UserCheck, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminGuard } from "@/components/admin/admin-guard";
import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/lib/auth-context";
import { getProfileDetails } from "@/lib/profile-db";
import { Avatar } from "@/components/shared/avatar";
import { LogoutConfirmationModal } from "@/components/profile/profile-modals";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Membership Plans", href: "/admin/plans", icon: Award },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Attendance", href: "/admin/attendance", icon: Calendar },
  { label: "BMI Reports", href: "/admin/bmi", icon: Activity },
  { label: "Trainers", href: "/admin/trainers", icon: UserCheck },
  { label: "Contact Enquiries", href: "/admin/enquiries", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Collapse sidebar on larger screens
  const [collapsed, setCollapsed] = useState(false);
  // Mobile drawer slide status
  const [mobileOpen, setMobileOpen] = useState(false);
  // Logout Modal
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Profile fields
  const [profileName, setProfileName] = useState("Admin");
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.displayName || "Admin");

    const loadProfile = async () => {
      try {
        const details = await getProfileDetails(user.uid, user.email, user.displayName);
        setProfileName(details.fullName);
        setPhotoURL(details.photoURL || null);
      } catch (err) {
        console.warn("Failed to load admin profile for topbar:", err);
      }
    };
    loadProfile();

    const handleStorageChange = () => {
      loadProfile();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  const handleLogout = async () => {
    setLogoutOpen(false);
    await logout();
    router.push("/");
  };

  const activeHeaderTitle = sidebarItems.find((item) => {
    if (item.href === "/admin") return pathname === "/admin";
    return pathname.startsWith(item.href);
  })?.label || "Admin Console";

  return (
    <AdminGuard>
      <div className="min-h-screen bg-ink flex text-white font-sans overflow-x-hidden">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside
          className={cn(
            "hidden lg:flex flex-col border-r border-white/5 bg-ink-soft transition-all duration-300 relative z-30 shrink-0",
            collapsed ? "w-20" : "w-64"
          )}
        >
          {/* Logo container */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
            {!collapsed ? (
              <Logo compact />
            ) : (
              <span className="font-heading font-black text-xs text-royal tracking-widest mx-auto">RF</span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
            {sidebarItems.map((item) => {
              const active = item.href === "/admin" 
                ? pathname === "/admin" 
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 py-3 px-4 rounded-xl font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                    active 
                      ? "bg-royal text-white shadow-glow-soft" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-4.5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Logout & Collapse Controls */}
          <div className="p-3 border-t border-white/5 space-y-1.5">
            <button
              onClick={() => setLogoutOpen(true)}
              className={cn(
                "flex items-center gap-3 w-full py-3 px-4 rounded-xl font-heading text-xs font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-500/5 transition-all duration-200",
                collapsed ? "justify-center" : ""
              )}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="size-4.5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex items-center justify-center w-full py-2 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>
        </aside>

        {/* --- MOBILE COLLAPSIBLE DRAWER --- */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop overlay */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Nav container */}
            <nav className="relative flex flex-col w-full max-w-xs bg-ink-soft h-full border-r border-white/5 p-6 animate-slide-in">
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <Logo compact />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-muted-foreground hover:text-white"
                >
                  <X className="size-4.5" />
                </button>
              </div>

              <div className="flex-1 py-6 space-y-1.5 overflow-y-auto">
                {sidebarItems.map((item) => {
                  const active = item.href === "/admin" 
                    ? pathname === "/admin" 
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 py-3.5 px-4 rounded-xl font-heading text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                        active 
                          ? "bg-royal text-white shadow-glow-soft" 
                          : "text-muted-foreground hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="size-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-white/5">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl font-heading text-xs font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-500/5 transition-all duration-200"
                >
                  <LogOut className="size-4.5 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* --- MAIN WORKSPACE AREA --- */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Bar Header */}
          <header className="h-20 border-b border-white/5 bg-ink-soft/40 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 relative z-20 shrink-0">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger menu */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden grid size-10 place-items-center rounded-full border border-white/10 text-white"
              >
                <Menu className="size-5" />
              </button>
              <h1 className="font-heading text-lg lg:text-xl font-black uppercase text-steel tracking-wider">
                {activeHeaderTitle}
              </h1>
            </div>

            {/* Right details: notifications & admin user */}
            <div className="flex items-center gap-4">
              <button className="grid size-10 place-items-center rounded-full border border-white/10 text-muted-foreground hover:text-white transition-colors relative">
                <Bell className="size-4" />
                {/* Simulated notifications indicator */}
                <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-royal" />
              </button>

              <div className="flex items-center gap-3 border-l border-white/5 pl-4 h-9">
                <span className="hidden md:block text-xs font-semibold text-white/80 select-none">
                  {profileName}
                </span>
                <Link href="/admin/settings" title="Admin Settings">
                  <Avatar size="sm" src={photoURL} name={profileName} className="border-white/10 hover:border-royal transition-all hover:scale-105" />
                </Link>
              </div>
            </div>
          </header>

          {/* Core Content Body */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative z-10">
            {children}
          </main>
        </div>
      </div>

      {/* Sign Out Modal */}
      <LogoutConfirmationModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </AdminGuard>
  );
}
