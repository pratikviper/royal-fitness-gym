"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Activity, 
  TrendingUp, 
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Weight,
  Layers,
  Sparkles
} from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  getProfileDetails, 
  getMembershipDetails,
  type UserProfileDetails,
  type UserMembership,
  type UserBmiDetails
} from "@/lib/profile-db";
import { useToast } from "@/components/ui/toast";
import { Avatar } from "@/components/shared/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RenewMembershipModal } from "@/components/profile/profile-modals";

interface MemberProgressPoint {
  date: string;
  weight: number;
  bmi: number;
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { id: memberId } = use(params);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileDetails | null>(null);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [bmiHistory, setBmiHistory] = useState<UserBmiDetails[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  // Renew modal trigger
  const [renewOpen, setRenewOpen] = useState(false);

  const loadMemberDetails = async () => {
    setLoading(true);
    try {
      let p: any = null;
      let m: any = null;
      let bLogs: any[] = [];
      let payLogs: any[] = [];
      let attLogs: any[] = [];

      if (db) {
        try {
          // Fetch Profile
          const docRef = doc(db, "users", memberId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            p = docSnap.data();
          }

          // Fetch Membership
          const mRef = doc(db, "memberships", memberId);
          const mSnap = await getDoc(mRef);
          if (mSnap.exists()) {
            m = mSnap.data();
          }

          // Fetch BMI
          const bmiSnap = await getDocs(collection(db, "bmi_reports"));
          bmiSnap.forEach((doc) => {
            const data = doc.data();
            if (data.uid === memberId) {
              bLogs.push(data);
            }
          });

          // Fetch Payments
          const paymentsSnap = await getDocs(collection(db, "payments"));
          paymentsSnap.forEach((doc) => {
            const data = doc.data();
            if (data.uid === memberId) {
              payLogs.push(data);
            }
          });

          // Fetch Attendance
          const attendanceSnap = await getDocs(collection(db, "attendance"));
          attendanceSnap.forEach((doc) => {
            const data = doc.data();
            if (data.uid === memberId) {
              attLogs.push(data);
            }
          });
        } catch (e) {
          console.warn("Firestore error loading member file, using local fallback:", e);
          ({ p, m, bLogs, payLogs, attLogs } = loadLocalDetailsFallback());
        }
      } else {
        ({ p, m, bLogs, payLogs, attLogs } = loadLocalDetailsFallback());
      }

      if (!p) {
        showToast("Member profile not found.", "error");
        router.push("/admin/members");
        return;
      }

      setProfile(p);
      setMembership(m);
      // Sort BMI history by date ascending for growth charts
      setBmiHistory(bLogs.sort((a,b) => new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime()));
      // Sort payments and attendance descending
      setPaymentHistory(payLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setAttendanceLogs(attLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    } catch (err) {
      console.error(err);
      showToast("Error loading member details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLocalDetailsFallback = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return { p: null, m: null, bLogs: [], payLogs: [], attLogs: [] };

    const pCached = localStorage.getItem(`rf_profile_${memberId}`);
    const mCached = localStorage.getItem(`rf_membership_${memberId}`);
    
    const p = pCached ? JSON.parse(pCached) : null;
    const m = mCached ? JSON.parse(mCached) : null;

    const bmiHistory = JSON.parse(localStorage.getItem(`rf_bmi_history_${memberId}`) || "[]");
    const payments = JSON.parse(localStorage.getItem("rf_payments") || "[]").filter((x: any) => x.uid === memberId);
    const attendance = JSON.parse(localStorage.getItem("rf_attendance") || "[]").filter((x: any) => x.uid === memberId);

    return { p, m, bLogs: bmiHistory, payLogs: payments, attLogs: attendance };
  };

  useEffect(() => {
    loadMemberDetails();
  }, [memberId]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Loading File Record...
        </p>
      </div>
    );
  }

  // Calculate membership metrics
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let daysRemaining = 0;
  let statusText = "No Subscription";
  let statusColor = "border-zinc-500/20 bg-zinc-500/5 text-zinc-400";
  let progressPercent = 0;

  if (membership) {
    const start = new Date(membership.startDate);
    const expiry = new Date(membership.endDate);
    const totalDays = Math.max(1, Math.round((expiry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const diffTime = expiry.getTime() - today.getTime();
    daysRemaining = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    const daysUsed = Math.max(0, totalDays - daysRemaining);
    progressPercent = Math.min(100, Math.max(0, (daysUsed / totalDays) * 100));

    if (membership.status === "Suspended" || profile.status === "Suspended") {
      statusText = "Suspended";
      statusColor = "border-zinc-500/20 bg-zinc-500/5 text-zinc-400";
    } else if (daysRemaining <= 0) {
      statusText = "Expired";
      statusColor = "border-rose-500/20 bg-rose-500/5 text-rose-400";
    } else if (daysRemaining <= 7) {
      statusText = "Expiring Soon";
      statusColor = "border-amber-500/20 bg-amber-500/5 text-amber-400";
    } else {
      statusText = "Active";
      statusColor = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
    }
  }

  // Latest BMI calculations
  const latestBmi = bmiHistory[bmiHistory.length - 1] || null;
  const previousBmi = bmiHistory.length > 1 ? bmiHistory[bmiHistory.length - 2] : null;

  // Custom Trend Line Plotter (SVG Generator)
  const renderTrendChart = (type: "weight" | "bmi") => {
    if (bmiHistory.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-32 bg-white/[0.01] border border-white/5 rounded-xl text-center p-4">
          <TrendingUp className="size-5 text-muted-foreground mb-1" />
          <p className="text-[10px] text-muted-foreground leading-normal">
            Assess member logs monthly to generate trends.
          </p>
        </div>
      );
    }

    const width = 300;
    const height = 100;
    const padding = 15;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const values = bmiHistory.map(h => type === "weight" ? h.weightKg : h.bmiScore);
    const minVal = Math.min(...values) * 0.95;
    const maxVal = Math.max(...values) * 1.05;
    const valueRange = maxVal - minVal;

    // Convert to coords
    const coords = bmiHistory.map((h, i) => {
      const x = padding + (i / (bmiHistory.length - 1)) * chartW;
      const y = padding + chartH - ((type === "weight" ? h.weightKg : h.bmiScore) - minVal) / valueRange * chartH;
      return { x, y, date: h.calculatedAt, val: type === "weight" ? h.weightKg : h.bmiScore };
    });

    let pathStr = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      pathStr += ` L ${coords[i].x} ${coords[i].y}`;
    }

    return (
      <div className="relative w-full bg-white/[0.01] border border-white/5 rounded-xl p-3">
        <div className="flex justify-between items-center mb-1 text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
          <span>{type === "weight" ? "Weight Progress" : "BMI Progress"}</span>
          <span className="text-white">
            {coords[0].val} → {coords[coords.length - 1].val} {type === "weight" ? "kg" : ""}
          </span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 overflow-visible">
          <path
            d={pathStr}
            fill="none"
            stroke="hsl(var(--royal))"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {coords.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r="3" fill="hsl(var(--royal-light))" />
              <text x={c.x} y={c.y - 6} fill="white" fontSize="6" textAnchor="middle">{c.val}</text>
            </g>
          ))}
        </svg>
        <div className="flex justify-between text-[7px] text-muted-foreground pt-1 border-t border-white/5 mt-1">
          <span>{coords[0].date}</span>
          <span>{coords[coords.length - 1].date}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. BACK BUTTON */}
      <div className="flex items-center">
        <Button
          onClick={() => router.push("/admin/members")}
          variant="ghost"
          className="text-xs uppercase tracking-wider text-muted-foreground hover:text-white flex items-center gap-1.5 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="size-4" /> Back to members directory
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Personal & Biometrics Profile File */}
        <div className="space-y-8 lg:col-span-1">
          {/* Card Summary Header */}
          <Card className="glass relative overflow-hidden ring-hairline">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-royal to-royal-light" />
            <CardContent className="pt-8 flex flex-col items-center text-center">
              <Avatar size="xl" src={profile.photoURL} name={profile.fullName} className="border-2 border-white/10 shadow-glow-soft" />
              <h3 className="mt-4 text-xl font-bold font-heading text-white">{profile.fullName}</h3>
              <p className="text-xs text-muted-foreground font-heading tracking-widest uppercase mt-0.5">{profile.membershipId}</p>
              
              <div className="mt-4">
                <Badge className={`border uppercase text-[9px] tracking-wider px-3 py-1 ${statusColor}`}>
                  {statusText}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info Ledger */}
          <Card className="glass border-white/5 ring-hairline">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading text-steel uppercase font-bold tracking-wider flex items-center gap-2">
                <User className="size-4 text-royal" /> Personal Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-start gap-3 border-b border-white/5 pb-3">
                <Mail className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground font-semibold">Email Address</p>
                  <p className="text-xs font-semibold text-white">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-b border-white/5 pb-3">
                <Phone className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground font-semibold">Phone Number</p>
                  <p className="text-xs font-semibold text-white">{profile.phoneNumber || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-b border-white/5 pb-3">
                <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground font-semibold">Resident Address</p>
                  <p className="text-xs font-semibold text-white">{profile.address || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-b border-white/5 pb-3">
                <Calendar className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground font-semibold">Date of Birth</p>
                  <p className="text-xs font-semibold text-white">{profile.dob || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground font-semibold">Emergency Contacts</p>
                  <p className="text-xs font-semibold text-white">{profile.emergencyContact || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fitness Biometrics */}
          <Card className="glass border-white/5 ring-hairline">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading text-steel uppercase font-bold tracking-wider flex items-center gap-2">
                <Activity className="size-4 text-royal" /> Fitness & Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-2.5 text-center">
                  <p className="text-[8px] uppercase text-muted-foreground font-semibold">Height</p>
                  <p className="text-sm font-heading font-black text-white mt-1">{latestBmi?.heightCm || profile.heightCm || "—"} cm</p>
                </div>
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-2.5 text-center">
                  <p className="text-[8px] uppercase text-muted-foreground font-semibold">Weight</p>
                  <p className="text-sm font-heading font-black text-white mt-1">{latestBmi?.weightKg || profile.weightKg || "—"} kg</p>
                </div>
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-2.5 text-center">
                  <p className="text-[8px] uppercase text-muted-foreground font-semibold">BMI</p>
                  <p className="text-sm font-heading font-black text-white mt-1">{latestBmi?.bmiScore || profile.bmiScore || "—"}</p>
                </div>
              </div>

              {latestBmi && (
                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 space-y-1">
                  <p className="text-[9px] uppercase text-royal font-bold tracking-widest flex items-center gap-1">
                    <Sparkles className="size-3 text-royal" /> Category
                  </p>
                  <p className="text-xs font-semibold text-white">{latestBmi.category}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Subscription cards, invoices, attendance checklists, charts */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* Membership Plan validity card */}
          {membership ? (
            <Card className="glass border-white/5 ring-hairline relative">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-heading text-steel uppercase font-bold tracking-wider flex items-center gap-2">
                      <Layers className="size-4.5 text-royal" /> Subscription Details
                    </CardTitle>
                    <CardDescription className="text-xs">Active package durations and parameters.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setRenewOpen(true)}
                    className="bg-royal hover:bg-royal-light text-white font-heading font-semibold text-xs px-4 h-9"
                  >
                    Renew Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Active Package banner */}
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-royal font-bold">Package Name</p>
                    <h4 className="font-heading text-lg font-black text-white mt-0.5">{membership.planName}</h4>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[8px] uppercase text-muted-foreground font-semibold">Total term</p>
                      <p className="text-sm font-bold text-white mt-0.5">{membership.durationMonths} Months</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase text-muted-foreground font-semibold">Price Paid</p>
                      <p className="text-sm font-bold text-white mt-0.5">₹{membership.pricePaid.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>

                {/* Dates logs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                    <p className="text-[8px] uppercase text-muted-foreground font-semibold">Start Date</p>
                    <p className="text-xs font-semibold text-white mt-0.5">{membership.startDate}</p>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                    <p className="text-[8px] uppercase text-muted-foreground font-semibold">Expiry Date</p>
                    <p className="text-xs font-semibold text-white mt-0.5">{membership.endDate}</p>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                    <p className="text-[8px] uppercase text-muted-foreground font-semibold">Days Validity</p>
                    <p className="text-xs font-semibold text-white mt-0.5">{membership.durationMonths * 30} Days</p>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                    <p className="text-[8px] uppercase text-muted-foreground font-semibold">Days Remaining</p>
                    <p className="text-xs font-black text-royal-light mt-0.5">{daysRemaining} Days</p>
                  </div>
                </div>

                {/* Consumption Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                    <span>Plan consumption</span>
                    <span className="text-white">{progressPercent.toFixed(0)}% Used</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-royal-gradient transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass border-white/5 ring-hairline p-6 text-center text-muted-foreground text-sm">
              No active subscription found. Assign a membership plan to seed log details.
            </Card>
          )}

          {/* Progress Section (Trend lines Weight / BMI) */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass border-white/5 ring-hairline">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading text-steel uppercase font-bold tracking-wider">Weight Logs</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {renderTrendChart("weight")}
              </CardContent>
            </Card>
            <Card className="glass border-white/5 ring-hairline">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading text-steel uppercase font-bold tracking-wider">BMI Analysis Logs</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {renderTrendChart("bmi")}
              </CardContent>
            </Card>
          </div>

          {/* Payments & Attendance history listings */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Payments Ledger */}
            <Card className="glass border-white/5 ring-hairline">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading text-steel uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <CreditCard className="size-4 text-royal" /> Invoice History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map((p) => (
                      <div key={p.invoiceNo} className="flex justify-between items-center border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                        <div>
                          <p className="text-xs font-semibold text-white">₹{p.amount.toLocaleString("en-IN")}</p>
                          <p className="text-[8px] font-heading text-muted-foreground uppercase tracking-widest mt-0.5">{p.invoiceNo} | {p.method}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[8px] uppercase tracking-wider text-emerald-400 font-bold">
                            {p.status}
                          </span>
                          <p className="text-[8px] text-muted-foreground mt-0.5">{p.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">No historical invoices.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attendance checklist logs */}
            <Card className="glass border-white/5 ring-hairline">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading text-steel uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Calendar className="size-4 text-royal" /> Check-in Records
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                  {attendanceLogs.length > 0 ? (
                    attendanceLogs.map((a) => (
                      <div key={a.date} className="flex justify-between items-center border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-xs text-white/80 font-medium">{a.date}</span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] uppercase tracking-wider font-bold ${
                          a.status === "Present" 
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" 
                            : "border-rose-500/20 bg-rose-500/5 text-rose-400"
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">No attendance checks recorded.</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>

      {/* RENEW PLAN ACTION MODAL */}
      {membership && (
        <RenewMembershipModal
          isOpen={renewOpen}
          onClose={() => setRenewOpen(false)}
          uid={memberId}
          onUpdate={(updated) => { setMembership(updated); loadMemberDetails(); }}
        />
      )}
    </div>
  );
}
