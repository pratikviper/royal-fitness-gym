"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  UserPlus, 
  Clock, 
  ArrowUpRight,
  Database,
  Loader2
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  getProfileDetails, 
  getMembershipDetails,
  type UserProfileDetails,
  type UserMembership
} from "@/lib/profile-db";
import { 
  MembershipGrowthChart, 
  RevenueChart, 
  PlanDistributionChart 
} from "@/components/admin/admin-charts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/avatar";

// Interfaces for dashboard lists
interface DashboardMember {
  uid: string;
  fullName: string;
  email: string;
  joiningDate: string;
  planName: string;
  photoURL?: string | null;
}

interface DashboardPayment {
  invoiceNo: string;
  fullName: string;
  planName: string;
  amount: number;
  status: string;
  date: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  // Stats states
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    newMembers: 0,
    revenueMonth: 0,
    pendingRenewals: 0,
    attendanceToday: 0,
    totalTrainers: 0
  });

  const [recentRegistrations, setRecentRegistrations] = useState<DashboardMember[]>([]);
  const [recentPayments, setRecentPayments] = useState<DashboardPayment[]>([]);

  // Chart data states
  const [growthData, setGrowthData] = useState<Array<{ label: string; value: number }>>([]);
  const [revenueData, setRevenueData] = useState<Array<{ label: string; value: number }>>([]);
  const [planShareData, setPlanShareData] = useState<Array<{ label: string; value: number }>>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let members: any[] = [];
        let memberships: Record<string, any> = {};
        let payments: any[] = [];
        let trainers: any[] = [];
        let attendance: any[] = [];

        // --- 1. FIREBASE QUERIES ---
        if (db) {
          try {
            // Fetch users (members only)
            const usersSnap = await getDocs(collection(db, "users"));
            usersSnap.forEach((doc) => {
              const u = doc.data();
              if (u.role === "member") {
                members.push(u);
              }
            });

            // Fetch memberships
            const membershipsSnap = await getDocs(collection(db, "memberships"));
            membershipsSnap.forEach((doc) => {
              memberships[doc.id] = doc.data();
            });

            // Fetch payments
            const paymentsSnap = await getDocs(collection(db, "payments"));
            paymentsSnap.forEach((doc) => {
              payments.push(doc.data());
            });

            // Fetch trainers
            const trainersSnap = await getDocs(collection(db, "trainers"));
            trainersSnap.forEach((doc) => {
              trainers.push(doc.data());
            });

            // Fetch attendance
            const attendanceSnap = await getDocs(collection(db, "attendance"));
            attendanceSnap.forEach((doc) => {
              attendance.push(doc.data());
            });
          } catch (e) {
            console.warn("Firestore fetch error, falling back to local storage:", e);
            ({ members, memberships, payments, trainers, attendance } = loadLocalStorageData());
          }
        } else {
          // --- 2. LOCALSTORAGE FALLBACKS ---
          ({ members, memberships, payments, trainers, attendance } = loadLocalStorageData());
        }

        // Check if database is empty
        if (members.length === 0 && payments.length === 0 && trainers.length === 0) {
          setIsEmpty(true);
          setLoading(false);
          return;
        }
        setIsEmpty(false);

        // --- 3. CALCULATE STATS ---
        const today = new Date();
        today.setHours(0,0,0,0);
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const todayStr = today.toISOString().split("T")[0];

        let activeCount = 0;
        let expiredCount = 0;
        let newCount = 0;
        let pendingRenew = 0;

        members.forEach((m) => {
          const memb = memberships[m.uid];
          
          // Joining date check
          if (m.joiningDate) {
            const jDate = new Date(m.joiningDate);
            if (jDate.getMonth() === currentMonth && jDate.getFullYear() === currentYear) {
              newCount++;
            }
          }

          if (memb) {
            const expiry = new Date(memb.endDate);
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) {
              expiredCount++;
            } else {
              activeCount++;
              if (diffDays <= 7) {
                pendingRenew++;
              }
            }
          }
        });

        // Revenue this month
        let monthlyRevenue = 0;
        const currentMonthName = today.toLocaleString("default", { month: "short" });

        payments.forEach((p) => {
          if (p.status === "Paid" && p.date) {
            const pDate = new Date(p.date);
            if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
              monthlyRevenue += p.amount;
            }
          }
        });

        // Today's attendance
        const attendanceTodayCount = attendance.filter(
          (a) => a.date === todayStr && a.status === "Present"
        ).length;

        setStats({
          totalMembers: members.length,
          activeMembers: activeCount,
          expiredMembers: expiredCount,
          newMembers: newCount,
          revenueMonth: monthlyRevenue,
          pendingRenewals: pendingRenew,
          attendanceToday: attendanceTodayCount,
          totalTrainers: trainers.length
        });

        // --- 4. PREPARE RECENT LISTS ---
        // Recent registrations (Sorted by joiningDate descending)
        const sortedRegs = [...members]
          .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
          .slice(0, 5)
          .map((m) => ({
            uid: m.uid,
            fullName: m.fullName,
            email: m.email,
            joiningDate: m.joiningDate,
            planName: memberships[m.uid]?.planName || "No Plan",
            photoURL: m.photoURL
          }));
        setRecentRegistrations(sortedRegs);

        // Recent payments (Sorted by date descending)
        const sortedPayments = [...payments]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map((p) => {
            const userProfile = members.find((m) => m.uid === p.uid);
            return {
              invoiceNo: p.invoiceNo,
              fullName: userProfile?.fullName || "Unknown Member",
              planName: p.planName,
              amount: p.amount,
              status: p.status,
              date: p.date
            };
          });
        setRecentPayments(sortedPayments);

        // --- 5. COMPUTE CHART VALUES ---
        // Plan Distribution
        const planDistribution: Record<string, number> = {};
        Object.values(memberships).forEach((m) => {
          planDistribution[m.planName] = (planDistribution[m.planName] || 0) + 1;
        });
        setPlanShareData(
          Object.entries(planDistribution).map(([label, value]) => ({ label, value }))
        );

        // Monthly Growth (Registrations in last 6 months)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const last6MonthsGrowth: Array<{ label: string; value: number }> = [];
        
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const mName = months[d.getMonth()];
          const mIdx = d.getMonth();
          const yVal = d.getFullYear();

          const count = members.filter((m) => {
            const jDate = new Date(m.joiningDate);
            return jDate.getMonth() <= mIdx && jDate.getFullYear() <= yVal;
          }).length;

          last6MonthsGrowth.push({ label: mName, value: count });
        }
        setGrowthData(last6MonthsGrowth);

        // Monthly Revenue (Paid amounts in last 6 months)
        const last6MonthsRevenue: Array<{ label: string; value: number }> = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const mName = months[d.getMonth()];
          const mIdx = d.getMonth();
          const yVal = d.getFullYear();

          const sum = payments.reduce((acc, p) => {
            if (p.status === "Paid" && p.date) {
              const pDate = new Date(p.date);
              if (pDate.getMonth() === mIdx && pDate.getFullYear() === yVal) {
                return acc + p.amount;
              }
            }
            return acc;
          }, 0);

          last6MonthsRevenue.push({ label: mName, value: sum });
        }
        setRevenueData(last6MonthsRevenue);

      } catch (err) {
        console.error("Dashboard calculation failed:", err);
      } finally {
        setLoadingData(false);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const loadLocalStorageData = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return { members: [], memberships: {}, payments: [], trainers: [], attendance: [] };

    const uidsJson = localStorage.getItem("rf_member_uids") || "[]";
    const uids = JSON.parse(uidsJson) as string[];
    
    const members: any[] = [];
    const memberships: Record<string, any> = {};

    uids.forEach((uid) => {
      const p = localStorage.getItem(`rf_profile_${uid}`);
      const m = localStorage.getItem(`rf_membership_${uid}`);
      if (p) members.push(JSON.parse(p));
      if (m) memberships[uid] = JSON.parse(m);
    });

    const payments = JSON.parse(localStorage.getItem("rf_payments") || "[]");
    const trainers = JSON.parse(localStorage.getItem("rf_trainers") || "[]");
    const attendance = JSON.parse(localStorage.getItem("rf_attendance") || "[]");

    return { members, memberships, payments, trainers, attendance };
  };

  const [loadingData, setLoadingData] = useState(true);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Compiling Stats...
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center max-w-md mx-auto">
        <div className="rounded-full bg-white/5 border border-white/10 p-6 text-muted-foreground">
          <Database className="size-12 text-royal animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold tracking-wide">No Data Available</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Gym management database is currently empty. Navigate to the Settings tab to seed dummy members, trainer assignments, and revenue reports.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/admin/settings")}
          className="bg-royal hover:bg-royal-light text-white font-heading font-semibold px-6"
        >
          Go to Settings
        </Button>
      </div>
    );
  }

  // Cards display configuration
  const cardItems = [
    { title: "Total Members", value: stats.totalMembers, description: "Registered profiles", icon: Users, color: "text-white" },
    { title: "Active Members", value: stats.activeMembers, description: "Current subscriptions", icon: UserCheck, color: "text-emerald-400" },
    { title: "Expired Memberships", value: stats.expiredMembers, description: "Needs renewal attention", icon: AlertTriangle, color: "text-rose-400" },
    { title: "New Members", value: stats.newMembers, description: "Joined this month", icon: UserPlus, color: "text-royal-light" },
    { title: "Revenue", value: `₹${stats.revenueMonth.toLocaleString("en-IN")}`, description: "Earned this month", icon: DollarSign, color: "text-emerald-400" },
    { title: "Pending Renewals", value: stats.pendingRenewals, description: "Expires in <= 7 days", icon: Clock, color: "text-amber-400" },
    { title: "Today's Attendance", value: stats.attendanceToday, description: "Checked-in members", icon: Calendar, color: "text-white" },
    { title: "Total Trainers", value: stats.totalTrainers, description: "Coaches assigned", icon: Users, color: "text-white" },
  ];

  return (
    <div className="space-y-8">
      {/* 1. CARDS GRID */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {cardItems.map((c, i) => (
          <Card key={i} className="glass border-white/5 ring-hairline">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{c.title}</CardTitle>
              <c.icon className={`size-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-black tracking-wide text-white">{c.value}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid gap-6 md:grid-cols-3">
        <MembershipGrowthChart data={growthData} />
        <RevenueChart data={revenueData} />
        <PlanDistributionChart data={planShareData} />
      </div>

      {/* 3. RECENT ACTIVITY LISTS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Registrations */}
        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-heading text-steel uppercase font-bold tracking-wider">Recent Registrations</CardTitle>
              <CardDescription className="text-xs">Latest members to join gym floors.</CardDescription>
            </div>
            <Button 
              onClick={() => router.push("/admin/members")}
              variant="ghost" 
              className="text-xs text-royal hover:underline flex items-center gap-1 p-0 hover:bg-transparent"
            >
              View All <ArrowUpRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {recentRegistrations.map((m) => (
                <div key={m.uid} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" src={m.photoURL} name={m.fullName} />
                    <div>
                      <p className="text-xs font-semibold text-white">{m.fullName}</p>
                      <p className="text-[10px] text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-royal-light tracking-wide">{m.planName}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Joined: {m.joiningDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-heading text-steel uppercase font-bold tracking-wider">Recent Invoices</CardTitle>
              <CardDescription className="text-xs">Latest subscription payments ledger.</CardDescription>
            </div>
            <Button 
              onClick={() => router.push("/admin/payments")}
              variant="ghost" 
              className="text-xs text-royal hover:underline flex items-center gap-1 p-0 hover:bg-transparent"
            >
              View All <ArrowUpRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {recentPayments.map((p) => (
                <div key={p.invoiceNo} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-semibold text-white">{p.fullName}</p>
                    <p className="text-[9px] font-heading text-muted-foreground tracking-wider uppercase">{p.invoiceNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-heading font-bold text-white">₹{p.amount.toLocaleString("en-IN")}</p>
                    <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[8px] uppercase tracking-wider text-emerald-400 font-bold mt-0.5">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
