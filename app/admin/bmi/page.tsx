"use client";

import React, { useEffect, useState } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/shared/avatar";

interface CompiledBmiRecord {
  uid: string;
  fullName: string;
  membershipId: string;
  photoURL?: string | null;
  
  // Current assessment
  currWeight: number;
  currHeight: number;
  currBmi: number;
  currCategory: string;
  lastCalculated: string;

  // Previous assessment
  prevWeight?: number;
  prevBmi?: number;
  
  // Computed changes
  weightChange: number; // curr - prev
  bmiChange: number;
}

export default function AdminBmiReportsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<CompiledBmiRecord[]>([]);

  // Search & filter
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadBmiDetails = async () => {
    setLoading(true);
    try {
      let members: any[] = [];
      let bmiLogs: any[] = [];

      if (db) {
        try {
          // Fetch members
          const usersSnap = await getDocs(collection(db, "users"));
          usersSnap.forEach((doc) => {
            const data = doc.data();
            if (data.role === "member") {
              members.push(data);
            }
          });

          // Fetch BMI history
          const bmiSnap = await getDocs(collection(db, "bmi_reports"));
          bmiSnap.forEach((doc) => {
            bmiLogs.push(doc.data());
          });
        } catch (e) {
          console.warn("Firestore BMI logs read error, using local fallback:", e);
          ({ members, bmiLogs } = loadLocalBmiLogsFallback());
        }
      } else {
        ({ members, bmiLogs } = loadLocalBmiLogsFallback());
      }

      // Compile current vs previous records for each member
      const compiled: CompiledBmiRecord[] = members
        .map((m) => {
          const userLogs = bmiLogs
            .filter((l) => l.uid === m.uid)
            .sort((a,b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()); // Latest first

          if (userLogs.length === 0) return null;

          const latest = userLogs[0];
          const previous = userLogs.length > 1 ? userLogs[1] : undefined;

          const currWeight = latest.weightKg;
          const currHeight = latest.heightCm;
          const currBmi = latest.bmiScore;
          const currCategory = latest.category;
          const lastCalculated = latest.calculatedAt;

          const prevWeight = previous ? previous.weightKg : undefined;
          const prevBmi = previous ? previous.bmiScore : undefined;

          const weightChange = previous ? (currWeight - previous.weightKg) : 0;
          const bmiChange = previous ? (currBmi - previous.bmiScore) : 0;

          return {
            uid: m.uid,
            fullName: m.fullName,
            membershipId: m.membershipId || `RF-${m.uid.slice(0,5)}`,
            photoURL: m.photoURL,
            currWeight,
            currHeight,
            currBmi,
            currCategory,
            lastCalculated,
            prevWeight,
            prevBmi,
            weightChange,
            bmiChange
          };
        })
        .filter(Boolean) as CompiledBmiRecord[];

      setRecords(compiled);
    } catch (err) {
      console.error(err);
      showToast("Failed to compile biometrics reports.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLocalBmiLogsFallback = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return { members: [], bmiLogs: [] };

    const uidsJson = localStorage.getItem("rf_member_uids") || "[]";
    const uids = JSON.parse(uidsJson) as string[];
    const members: any[] = [];
    const bmiLogs: any[] = [];

    uids.forEach((uid) => {
      const cached = localStorage.getItem(`rf_profile_${uid}`);
      if (cached) members.push(JSON.parse(cached));
      
      const bHistoryJson = localStorage.getItem(`rf_bmi_history_${uid}`) || "[]";
      const bHistory = JSON.parse(bHistoryJson);
      bmiLogs.push(...bHistory);
    });

    return { members, bmiLogs };
  };

  useEffect(() => {
    loadBmiDetails();
  }, []);

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch = 
      r.fullName.toLowerCase().includes(search.toLowerCase()) || 
      r.membershipId.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === "all" || 
      r.currCategory.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate statistics across filtered records
  const totalCount = filteredRecords.length;
  const normalCount = filteredRecords.filter((r) => r.currCategory === "Normal").length;
  const overweightCount = filteredRecords.filter((r) => r.currCategory === "Overweight").length;
  const obeseCount = filteredRecords.filter((r) => r.currCategory === "Obese").length;
  const underweightCount = filteredRecords.filter((r) => r.currCategory === "Underweight").length;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Compiling Biometric Metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. HEALTH DISTRIBUTION SUMMARIES */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-semibold">Normal weight</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">{normalCount} / {totalCount}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Healthy BMI metrics (18.5 - 24.9)</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-semibold">Overweight risk</span>
            <AlertTriangle className="size-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">{overweightCount}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Moderate risk (25.0 - 29.9)</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-semibold">Obese boundaries</span>
            <AlertTriangle className="size-4 text-rose-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">{obeseCount}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">High clinical risk (&gt;= 30.0)</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-semibold">Underweight logs</span>
            <Activity className="size-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">{underweightCount}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Needs mass program plans (&lt; 18.5)</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. FILTERS PANEL */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-ink-soft/40 border border-white/5 rounded-2xl p-4">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member biometrics..."
            className="pl-10 border-white/5 focus-visible:border-royal bg-white/[0.01]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="size-3.5 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 text-xs px-3 bg-white/[0.02] border border-white/10 hover:border-white/20 text-white rounded-lg focus:outline-none focus:border-royal w-full md:w-auto"
          >
            <option value="all" className="bg-ink-soft">All Biometrics</option>
            <option value="normal" className="bg-ink-soft">Normal BMI</option>
            <option value="overweight" className="bg-ink-soft">Overweight</option>
            <option value="obese" className="bg-ink-soft">Obese</option>
            <option value="underweight" className="bg-ink-soft">Underweight</option>
          </select>
        </div>
      </div>

      {/* 3. REPORT DATA TABLE */}
      <Card className="glass border-white/5 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="py-4 px-4">Member</th>
                <th className="py-4 px-4">Height (cm)</th>
                <th className="py-4 px-4">Previous Weight</th>
                <th className="py-4 px-4">Current Weight</th>
                <th className="py-4 px-4">Weight Difference</th>
                <th className="py-4 px-4">Current BMI</th>
                <th className="py-4 px-4">Health Status</th>
                <th className="py-4 px-4">Last Assessment</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => {
                  let badgeCol = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
                  if (r.currCategory === "Obese") badgeCol = "border-rose-500/20 bg-rose-500/5 text-rose-400 animate-pulse";
                  else if (r.currCategory === "Overweight") badgeCol = "border-amber-500/20 bg-amber-500/5 text-amber-400";
                  else if (r.currCategory === "Underweight") badgeCol = "border-blue-500/20 bg-blue-500/5 text-blue-400";

                  const wtDiff = r.weightChange;
                  const isWeightLoss = wtDiff < 0;
                  const isNoChange = wtDiff === 0;

                  return (
                    <tr key={r.uid} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <Avatar size="sm" src={r.photoURL} name={r.fullName} />
                        <div>
                          <p className="font-bold text-white leading-none">{r.fullName}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{r.membershipId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-white/90">{r.currHeight} cm</td>
                      <td className="py-4 px-4 text-muted-foreground">{r.prevWeight ? `${r.prevWeight} kg` : "—"}</td>
                      <td className="py-4 px-4 font-bold text-white">{r.currWeight} kg</td>
                      <td className="py-4 px-4">
                        {!r.prevWeight ? (
                          <span className="text-[10px] text-muted-foreground">First check</span>
                        ) : isNoChange ? (
                          <span className="text-[10px] text-zinc-400 font-semibold">— Stable</span>
                        ) : isWeightLoss ? (
                          <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400 font-bold">
                            <TrendingDown className="size-3.5" /> {Math.abs(wtDiff).toFixed(1)} kg
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-400 font-bold">
                            <TrendingUp className="size-3.5" /> +{Math.abs(wtDiff).toFixed(1)} kg
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-heading font-black text-sm text-white">{r.currBmi}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] uppercase tracking-wider font-bold ${badgeCol}`}>
                          {r.currCategory}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{r.lastCalculated}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No biometrics logs match filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
