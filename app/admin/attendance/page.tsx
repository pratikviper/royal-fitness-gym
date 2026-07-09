"use client";

import React, { useEffect, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  Search, 
  Loader2, 
  CheckCircle,
  TrendingUp,
  Percent,
  Users
} from "lucide-react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/shared/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AttendanceRecord {
  uid: string;
  fullName: string;
  membershipId: string;
  photoURL?: string | null;
  status: "Present" | "Absent" | "Unmarked";
}

export default function AdminAttendancePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Date selector
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [rawAttendanceLogs, setRawAttendanceLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      let members: any[] = [];
      let logs: any[] = [];

      if (db) {
        try {
          // Fetch members
          const usersSnap = await getDocs(collection(db, "users"));
          usersSnap.forEach((doc) => {
            const data = doc.data();
            if (data.role === "member") {
              members.push(doc.data());
            }
          });

          // Fetch attendance logs
          const attSnap = await getDocs(collection(db, "attendance"));
          attSnap.forEach((doc) => {
            logs.push(doc.data());
          });
        } catch (e) {
          console.warn("Firestore attendance error, using local fallback:", e);
          ({ members, logs } = loadLocalAttendanceFallback());
        }
      } else {
        ({ members, logs } = loadLocalAttendanceFallback());
      }

      setRawAttendanceLogs(logs);

      // Compile attendance list for currently selected date
      const compiled: AttendanceRecord[] = members.map((m) => {
        const matchingLog = logs.find((l) => l.uid === m.uid && l.date === selectedDate);
        return {
          uid: m.uid,
          fullName: m.fullName,
          membershipId: m.membershipId || `RF-${m.uid.slice(0,5)}`,
          photoURL: m.photoURL,
          status: matchingLog ? matchingLog.status : "Unmarked"
        };
      });

      setAttendance(compiled);
    } catch (err) {
      console.error(err);
      showToast("Failed to load attendance registry.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLocalAttendanceFallback = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return { members: [], logs: [] };

    const uidsJson = localStorage.getItem("rf_member_uids") || "[]";
    const uids = JSON.parse(uidsJson) as string[];
    const members: any[] = [];

    uids.forEach((uid) => {
      const cached = localStorage.getItem(`rf_profile_${uid}`);
      if (cached) members.push(JSON.parse(cached));
    });

    const logs = JSON.parse(localStorage.getItem("rf_attendance") || "[]");
    return { members, logs };
  };

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  const handleMarkAttendance = async (uid: string, status: "Present" | "Absent") => {
    try {
      if (db) {
        const attId = `${uid}_${selectedDate}`;
        await setDoc(doc(db, "attendance", attId), {
          uid,
          date: selectedDate,
          status
        });
      } else {
        // LocalStorage write
        const cached = localStorage.getItem("rf_attendance") || "[]";
        const logs = JSON.parse(cached) as any[];
        
        // Remove existing log for this user & date
        const filteredLogs = logs.filter((l) => !(l.uid === uid && l.date === selectedDate));
        filteredLogs.push({
          uid,
          date: selectedDate,
          status
        });

        localStorage.setItem("rf_attendance", JSON.stringify(filteredLogs));
      }

      // Update state locally for instant responsiveness
      setAttendance((prev) => 
        prev.map((item) => item.uid === uid ? { ...item, status } : item)
      );

      // Re-trigger global raw stats recalculation
      const updatedLogs = rawAttendanceLogs.filter((l) => !(l.uid === uid && l.date === selectedDate));
      updatedLogs.push({ uid, date: selectedDate, status });
      setRawAttendanceLogs(updatedLogs);

      showToast(`Attendance marked as ${status}.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to record attendance.", "error");
    }
  };

  // Compute metrics
  const totalGymMembers = attendance.length;
  const presentToday = attendance.filter((a) => a.status === "Present").length;
  const absentToday = attendance.filter((a) => a.status === "Absent").length;
  const unmarkedToday = attendance.filter((a) => a.status === "Unmarked").length;

  const todayRate = totalGymMembers > 0 
    ? (presentToday / (presentToday + absentToday || 1)) * 100 
    : 0;

  // Compute general average metrics (Last 7 days rate)
  const last7DaysLogs = rawAttendanceLogs.filter((l) => {
    const todayVal = new Date();
    const lDate = new Date(l.date);
    const diff = todayVal.getTime() - lDate.getTime();
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const last7DaysPresents = last7DaysLogs.filter((l) => l.status === "Present").length;
  const last7DaysRate = last7DaysLogs.length > 0 
    ? (last7DaysPresents / last7DaysLogs.length) * 100 
    : 80;

  // Filter members list based on search
  const filteredAttendance = attendance.filter((a) => 
    a.fullName.toLowerCase().includes(search.toLowerCase()) || 
    a.membershipId.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Compiling Attendance Log...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. METRICS ROW */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Present Checked</span>
            <CheckCircle className="size-4 text-emerald-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">{presentToday} / {totalGymMembers}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Active checked-in users</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Today's Check-in Rate</span>
            <Percent className="size-4 text-royal-light" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">{todayRate.toFixed(0)}%</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Check-in statistics</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Weekly Check-in Rate</span>
            <TrendingUp className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">{last7DaysRate.toFixed(0)}%</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Average over last 7 days</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Unmarked Records</span>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">{unmarkedToday}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Members yet to mark</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. DATE SELECTOR CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-ink-soft/40 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <CalendarIcon className="size-4 text-royal shrink-0" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-white/10 text-white w-full md:w-56 focus-visible:border-royal bg-white/[0.01]"
          />
        </div>

        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member by ID or Name..."
            className="pl-10 border-white/5 focus-visible:border-royal bg-white/[0.01]"
          />
        </div>
      </div>

      {/* 3. ATTENDANCE LIST GRID */}
      <Card className="glass border-white/5 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="py-4 px-4">Member Info</th>
                <th className="py-4 px-4">Membership ID</th>
                <th className="py-4 px-4">Log Status</th>
                <th className="py-4 px-4 text-center">Toggle status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((m) => {
                  let statusCol = "border-zinc-500/20 bg-zinc-500/5 text-zinc-400";
                  if (m.status === "Present") statusCol = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
                  else if (m.status === "Absent") statusCol = "border-rose-500/20 bg-rose-500/5 text-rose-400";

                  return (
                    <tr key={m.uid} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <Avatar size="sm" src={m.photoURL} name={m.fullName} />
                        <span className="font-bold text-white leading-none">{m.fullName}</span>
                      </td>
                      <td className="py-3 px-4 font-heading font-semibold text-white tracking-widest">{m.membershipId}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] uppercase tracking-wider font-bold ${statusCol}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handleMarkAttendance(m.uid, "Present")}
                            className={`px-3 py-1.5 h-8 text-[9px] uppercase font-bold tracking-wider rounded-lg flex items-center gap-1 transition-all ${
                              m.status === "Present" 
                                ? "bg-emerald-500 text-white shadow-glow-soft" 
                                : "bg-white/5 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                            }`}
                          >
                            <Check className="size-3 shrink-0" /> Present
                          </Button>
                          <Button
                            onClick={() => handleMarkAttendance(m.uid, "Absent")}
                            className={`px-3 py-1.5 h-8 text-[9px] uppercase font-bold tracking-wider rounded-lg flex items-center gap-1 transition-all ${
                              m.status === "Absent" 
                                ? "bg-rose-600 text-white shadow-glow-soft" 
                                : "bg-white/5 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white"
                            }`}
                          >
                            <X className="size-3 shrink-0" /> Absent
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
                    No members match search criteria.
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
