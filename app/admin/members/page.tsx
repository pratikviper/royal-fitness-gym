"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit2, 
  RefreshCw, 
  UserMinus, 
  Trash2, 
  Loader2, 
  UserPlus, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  getProfileDetails, 
  getMembershipDetails,
  type UserProfileDetails,
  type UserMembership
} from "@/lib/profile-db";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/shared/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";

// Detailed member structure compiled for the table
interface CompiledMember {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  joiningDate: string;
  membershipId: string;
  gender?: string;
  age?: number;
  photoURL?: string | null;
  
  // Membership Plan
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: "Active" | "Expiring Soon" | "Expired" | "Suspended";
  pricePaid: number;
  durationMonths: number;

  // Biometrics
  heightCm?: number;
  weightKg?: number;
  bmiScore?: number;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [members, setMembers] = useState<CompiledMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [selectedMember, setSelectedMember] = useState<CompiledMember | null>(null);
  const [modals, setModals] = useState({
    edit: false,
    renew: false,
    suspend: false,
    delete: false,
  });

  // Edit form states
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    gender: "",
    age: "",
    heightCm: "",
    weightKg: "",
  });

  // Renew form states
  const [renewForm, setRenewForm] = useState({
    planId: "all-in-one",
    months: "3",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      let uids: string[] = [];
      let rawProfiles: Record<string, any> = {};
      let rawMemberships: Record<string, any> = {};
      let rawBmiHistory: Record<string, any> = {};

      if (db) {
        try {
          // Fetch profiles
          const usersSnap = await getDocs(collection(db, "users"));
          usersSnap.forEach((doc) => {
            const data = doc.data();
            if (data.role === "member") {
              uids.push(doc.id);
              rawProfiles[doc.id] = data;
            }
          });

          // Fetch memberships
          const membershipsSnap = await getDocs(collection(db, "memberships"));
          membershipsSnap.forEach((doc) => {
            rawMemberships[doc.id] = doc.data();
          });

          // Fetch BMI logs
          const bmiSnap = await getDocs(collection(db, "bmi_reports"));
          bmiSnap.forEach((doc) => {
            const data = doc.data();
            if (!rawBmiHistory[data.uid]) {
              rawBmiHistory[data.uid] = [];
            }
            rawBmiHistory[data.uid].push(data);
          });
        } catch (e) {
          console.warn("Firestore error reading members list, using localStorage fallback:", e);
          ({ uids, rawProfiles, rawMemberships, rawBmiHistory } = loadLocalDataFallback());
        }
      } else {
        ({ uids, rawProfiles, rawMemberships, rawBmiHistory } = loadLocalDataFallback());
      }

      // Compile data
      const compiled: CompiledMember[] = uids.map((uid) => {
        const p = rawProfiles[uid];
        const m = rawMemberships[uid];
        const bmiLogs = rawBmiHistory[uid] || [];
        
        // Find latest BMI log
        const latestBmi = bmiLogs.length > 0 
          ? [...bmiLogs].sort((a,b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime())[0]
          : null;

        // Calculate validity
        const today = new Date();
        today.setHours(0,0,0,0);
        let planId = "weight-training";
        let planName = "Weight Training";
        let startDate = getPastDateStr(30);
        let endDate = getFutureDateStr(60);
        let durationMonths = 3;
        let pricePaid = 4500;
        let daysRemaining = 60;
        let status: CompiledMember["status"] = "Active";

        if (m) {
          planId = m.planId;
          planName = m.planName;
          startDate = m.startDate;
          endDate = m.endDate;
          durationMonths = m.durationMonths;
          pricePaid = m.pricePaid;

          const expiry = new Date(m.endDate);
          const diffTime = expiry.getTime() - today.getTime();
          daysRemaining = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

          // Check if suspended
          if (m.status === "Suspended" || p.status === "Suspended") {
            status = "Suspended";
          } else if (daysRemaining <= 0) {
            status = "Expired";
          } else if (daysRemaining <= 7) {
            status = "Expiring Soon";
          } else {
            status = "Active";
          }
        }

        return {
          uid,
          fullName: p.fullName || "Member",
          email: p.email || "",
          phoneNumber: p.phoneNumber || "",
          joiningDate: p.joiningDate || getPastDateStr(30),
          membershipId: p.membershipId || `RF-${uid.slice(0, 5)}`,
          gender: p.gender,
          age: p.age,
          photoURL: p.photoURL,
          
          planId,
          planName,
          startDate,
          endDate,
          daysRemaining,
          status,
          pricePaid,
          durationMonths,

          heightCm: latestBmi?.heightCm || p.heightCm,
          weightKg: latestBmi?.weightKg || p.weightKg,
          bmiScore: latestBmi?.bmiScore || p.bmiScore
        };
      });

      setMembers(compiled);
    } catch (err) {
      console.error(err);
      showToast("Failed to compile members list.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLocalDataFallback = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return { uids: [], rawProfiles: {}, rawMemberships: {}, rawBmiHistory: {} };

    const uidsJson = localStorage.getItem("rf_member_uids") || "[]";
    const uids = JSON.parse(uidsJson) as string[];
    
    const rawProfiles: Record<string, any> = {};
    const rawMemberships: Record<string, any> = {};
    const rawBmiHistory: Record<string, any> = {};

    uids.forEach((uid) => {
      const p = localStorage.getItem(`rf_profile_${uid}`);
      const m = localStorage.getItem(`rf_membership_${uid}`);
      const b = localStorage.getItem(`rf_bmi_history_${uid}`);

      if (p) rawProfiles[uid] = JSON.parse(p);
      if (m) rawMemberships[uid] = JSON.parse(m);
      if (b) rawBmiHistory[uid] = JSON.parse(b);
    });

    return { uids, rawProfiles, rawMemberships, rawBmiHistory };
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPastDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  const getFutureDateStr = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split("T")[0];
  };

  // Trigger actions
  const openEditModal = (member: CompiledMember) => {
    setSelectedMember(member);
    setEditForm({
      fullName: member.fullName,
      phoneNumber: member.phoneNumber,
      email: member.email,
      gender: member.gender || "Male",
      age: member.age?.toString() || "25",
      heightCm: member.heightCm?.toString() || "175",
      weightKg: member.weightKg?.toString() || "70",
    });
    setModals((m) => ({ ...m, edit: true }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      const parsedAge = parseInt(editForm.age) || 25;
      const parsedHeight = parseFloat(editForm.heightCm) || 175;
      const parsedWeight = parseFloat(editForm.weightKg) || 70;
      
      const calculateBmiScore = (h: number, w: number) => {
        const m = h / 100;
        return Math.round((w / (m * m)) * 10) / 10;
      };

      const bmiScore = calculateBmiScore(parsedHeight, parsedWeight);

      // Check current profile
      let rawProfile: any = {};
      if (db) {
        const snap = await getDoc(doc(db, "users", selectedMember.uid));
        rawProfile = snap.exists() ? snap.data() : {};
      } else {
        const cached = localStorage.getItem(`rf_profile_${selectedMember.uid}`);
        rawProfile = cached ? JSON.parse(cached) : {};
      }

      const updatedProfile = {
        ...rawProfile,
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        email: editForm.email,
        gender: editForm.gender,
        age: parsedAge,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        bmiScore,
      };

      if (db) {
        await setDoc(doc(db, "users", selectedMember.uid), updatedProfile, { merge: true });
        
        // Write to BMI reports history
        const repId = `${selectedMember.uid}_${new Date().toISOString().split("T")[0]}`;
        const calculateBmiDetails = (h: number, w: number) => {
          const rounded = bmiScore;
          let category = "Normal";
          if (rounded < 18.5) category = "Underweight";
          else if (rounded < 25) category = "Normal";
          else if (rounded < 30) category = "Overweight";
          else category = "Obese";
          return { rounded, category };
        };
        const bmiDet = calculateBmiDetails(parsedHeight, parsedWeight);
        await setDoc(doc(db, "bmi_reports", repId), {
          uid: selectedMember.uid,
          heightCm: parsedHeight,
          weightKg: parsedWeight,
          calculatedAt: new Date().toISOString().split("T")[0],
          bmiScore: bmiDet.rounded,
          category: bmiDet.category
        });

      } else {
        localStorage.setItem(`rf_profile_${selectedMember.uid}`, JSON.stringify(updatedProfile));
        
        // LocalStorage BMI history list
        const bmiHistoryJson = localStorage.getItem(`rf_bmi_history_${selectedMember.uid}`) || "[]";
        const bmiHistory = JSON.parse(bmiHistoryJson);
        const calculateBmiDetails = (h: number, w: number) => {
          const rounded = bmiScore;
          let category = "Normal";
          if (rounded < 18.5) category = "Underweight";
          else if (rounded < 25) category = "Normal";
          else if (rounded < 30) category = "Overweight";
          else category = "Obese";
          return { rounded, category };
        };
        const bmiDet = calculateBmiDetails(parsedHeight, parsedWeight);
        bmiHistory.push({
          uid: selectedMember.uid,
          heightCm: parsedHeight,
          weightKg: parsedWeight,
          calculatedAt: new Date().toISOString().split("T")[0],
          bmiScore: bmiDet.rounded,
          category: bmiDet.category
        });
        localStorage.setItem(`rf_bmi_history_${selectedMember.uid}`, JSON.stringify(bmiHistory));
      }

      showToast("Member profile updated successfully!", "success");
      setModals((m) => ({ ...m, edit: false }));
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to edit member profile.", "error");
    }
  };

  const openRenewModal = (member: CompiledMember) => {
    setSelectedMember(member);
    setRenewForm({
      planId: member.planId,
      months: "3",
    });
    setModals((m) => ({ ...m, renew: true }));
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      const plans = [
        { id: "weight-training", name: "Weight Training", prices: { "3": 4500, "6": 6500, "12": 9000 } },
        { id: "weight-cardio", name: "Weight Training + Cardio", prices: { "3": 5500, "6": 7500, "12": 12000 } },
        { id: "all-in-one", name: "All In One", prices: { "3": 6500, "6": 9000, "12": 14000 } },
      ];

      const selectedPlan = plans.find((p) => p.id === renewForm.planId) || plans[2];
      const durationMonths = parseInt(renewForm.months);
      const price = (selectedPlan.prices as Record<string, number>)[renewForm.months] || 6500;

      const startDate = new Date().toISOString().split("T")[0];
      const end = new Date();
      end.setMonth(end.getMonth() + durationMonths);
      const endDate = end.toISOString().split("T")[0];

      const updatedMembership = {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        startDate,
        endDate,
        durationMonths,
        pricePaid: price,
        status: "Active"
      };

      if (db) {
        await setDoc(doc(db, "memberships", selectedMember.uid), updatedMembership);
        
        // Add invoice ledger record
        const invoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        await setDoc(doc(db, "payments", invoiceNo), {
          invoiceNo,
          uid: selectedMember.uid,
          planName: selectedPlan.name,
          amount: price,
          method: "UPI",
          status: "Paid",
          date: startDate
        });
      } else {
        localStorage.setItem(`rf_membership_${selectedMember.uid}`, JSON.stringify(updatedMembership));
        
        // Local payments ledger
        const paymentsJson = localStorage.getItem("rf_payments") || "[]";
        const payments = JSON.parse(paymentsJson);
        const invoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        payments.push({
          invoiceNo,
          uid: selectedMember.uid,
          planName: selectedPlan.name,
          amount: price,
          method: "UPI",
          status: "Paid",
          date: startDate
        });
        localStorage.setItem("rf_payments", JSON.stringify(payments));
      }

      showToast(`Membership renewed to ${selectedPlan.name}!`, "success");
      setModals((m) => ({ ...m, renew: false }));
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to renew membership.", "error");
    }
  };

  const handleToggleSuspend = async (member: CompiledMember) => {
    try {
      let currentMembership: any = {};
      if (db) {
        const snap = await getDoc(doc(db, "memberships", member.uid));
        currentMembership = snap.exists() ? snap.data() : {};
      } else {
        const cached = localStorage.getItem(`rf_membership_${member.uid}`);
        currentMembership = cached ? JSON.parse(cached) : {};
      }

      const isSuspended = currentMembership.status === "Suspended";
      const updatedMembership = {
        ...currentMembership,
        status: isSuspended ? "Active" : "Suspended",
      };

      if (db) {
        await setDoc(doc(db, "memberships", member.uid), updatedMembership, { merge: true });
      } else {
        localStorage.setItem(`rf_membership_${member.uid}`, JSON.stringify(updatedMembership));
      }

      showToast(
        isSuspended 
          ? "Membership restored successfully!" 
          : "Membership suspended successfully.", 
        isSuspended ? "success" : "error"
      );
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to update suspension state.", "error");
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "users", selectedMember.uid));
        await deleteDoc(doc(db, "memberships", selectedMember.uid));
      } else {
        // LocalStorage delete
        const uidsJson = localStorage.getItem("rf_member_uids") || "[]";
        const uids = JSON.parse(uidsJson) as string[];
        const filteredUids = uids.filter((uid) => uid !== selectedMember.uid);
        localStorage.setItem("rf_member_uids", JSON.stringify(filteredUids));

        localStorage.removeItem(`rf_profile_${selectedMember.uid}`);
        localStorage.removeItem(`rf_membership_${selectedMember.uid}`);
        localStorage.removeItem(`rf_bmi_history_${selectedMember.uid}`);
      }

      showToast("Member deleted from database.", "success");
      setModals((m) => ({ ...m, delete: false }));
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete member.", "error");
    }
  };

  // Export Table Data to CSV
  const exportToCSV = () => {
    const headers = [
      "Member ID", "Name", "Email", "Phone", "Gender", "Age", 
      "Plan", "Status", "Start Date", "Expiry Date", "Days Remaining",
      "Height (cm)", "Weight (kg)", "BMI"
    ];
    
    const rows = filteredMembers.map((m) => [
      m.membershipId,
      m.fullName,
      m.email,
      m.phoneNumber,
      m.gender || "",
      m.age || "",
      m.planName,
      m.status,
      m.startDate,
      m.endDate,
      m.daysRemaining,
      m.heightCm || "",
      m.weightKg || "",
      m.bmiScore || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `royal_fitness_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search & Sort operations
  const filteredMembers = members
    .filter((m) => {
      const matchesSearch = 
        m.fullName.toLowerCase().includes(search.toLowerCase()) || 
        m.email.toLowerCase().includes(search.toLowerCase()) || 
        m.membershipId.toLowerCase().includes(search.toLowerCase());
      
      const matchesPlan = planFilter === "all" || m.planId === planFilter;
      const matchesStatus = statusFilter === "all" || m.status.toLowerCase().replace(" ", "") === statusFilter.toLowerCase();

      return matchesSearch && matchesPlan && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.fullName.localeCompare(b.fullName);
      if (sortBy === "name-desc") return b.fullName.localeCompare(a.fullName);
      if (sortBy === "join-desc") return new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime();
      if (sortBy === "expiry-asc") return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      return 0;
    });

  // Pagination calculation
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Compiling Member Grid...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. FILTER CONTROLS BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-ink-soft/40 border border-white/5 rounded-2xl p-4">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by ID, Name, Email..."
            className="pl-10 border-white/5 focus-visible:border-royal bg-white/[0.01]"
          />
        </div>

        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
              className="h-10 text-xs px-3 bg-white/[0.02] border border-white/10 hover:border-white/20 text-white rounded-lg focus:outline-none focus:border-royal"
            >
              <option value="all" className="bg-ink-soft">All Packages</option>
              <option value="weight-training" className="bg-ink-soft">Weight Training</option>
              <option value="weight-cardio" className="bg-ink-soft">WT + Cardio</option>
              <option value="all-in-one" className="bg-ink-soft">All In One</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 text-xs px-3 bg-white/[0.02] border border-white/10 hover:border-white/20 text-white rounded-lg focus:outline-none focus:border-royal"
          >
            <option value="all" className="bg-ink-soft">All Statuses</option>
            <option value="active" className="bg-ink-soft">Active</option>
            <option value="expiringsoon" className="bg-ink-soft">Expiring Soon</option>
            <option value="expired" className="bg-ink-soft">Expired</option>
            <option value="suspended" className="bg-ink-soft">Suspended</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 text-xs px-3 bg-white/[0.02] border border-white/10 hover:border-white/20 text-white rounded-lg focus:outline-none focus:border-royal"
          >
            <option value="name-asc" className="bg-ink-soft">Name (A-Z)</option>
            <option value="name-desc" className="bg-ink-soft">Name (Z-A)</option>
            <option value="join-desc" className="bg-ink-soft">Joined (Latest)</option>
            <option value="expiry-asc" className="bg-ink-soft">Expiry (Soonest)</option>
          </select>

          <Button 
            onClick={exportToCSV}
            className="h-10 border border-royal bg-royal/5 hover:bg-royal text-royal hover:text-white rounded-lg font-heading font-semibold flex items-center gap-1.5 px-4"
          >
            <Download className="size-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* 2. MEMBERS DATA TABLE */}
      <Card className="glass border-white/5 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="py-4 px-4">Member</th>
                <th className="py-4 px-4">Member ID</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Validity</th>
                <th className="py-4 px-4">Biometrics</th>
                <th className="py-4 px-4">Plan Share</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((m) => {
                  let badgeCol = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
                  if (m.status === "Expired") badgeCol = "border-rose-500/20 bg-rose-500/5 text-rose-400";
                  else if (m.status === "Expiring Soon") badgeCol = "border-amber-500/20 bg-amber-500/5 text-amber-400";
                  else if (m.status === "Suspended") badgeCol = "border-zinc-500/20 bg-zinc-500/5 text-zinc-400";

                  return (
                    <tr key={m.uid} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <Avatar size="sm" src={m.photoURL} name={m.fullName} />
                        <div>
                          <p className="font-bold text-white leading-none">{m.fullName}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{m.gender || "M/F"}, Age: {m.age || "—"}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-heading font-semibold text-white tracking-widest">{m.membershipId}</td>
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">{m.phoneNumber}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{m.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">Expires: {m.endDate}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${
                          m.daysRemaining <= 0 ? "text-rose-400" : m.daysRemaining <= 7 ? "text-amber-400" : "text-muted-foreground"
                        }`}>
                          {m.daysRemaining} Days remaining
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        {m.heightCm && m.weightKg ? (
                          <>
                            <p className="text-white font-semibold">BMI: {m.bmiScore || "—"}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{m.heightCm}cm | {m.weightKg}kg</p>
                          </>
                        ) : "—"}
                      </td>
                      <td className="py-4 px-4 font-heading font-black text-royal-light uppercase tracking-wider">{m.planName}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-bold ${badgeCol}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => router.push(`/admin/members/${m.uid}`)}
                            title="View Profile File"
                            className="bg-white/5 hover:bg-royal hover:text-white p-2 rounded-lg size-8 flex items-center justify-center"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          <Button
                            onClick={() => openEditModal(m)}
                            title="Edit Profile"
                            className="bg-white/5 hover:bg-royal hover:text-white p-2 rounded-lg size-8 flex items-center justify-center"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            onClick={() => openRenewModal(m)}
                            title="Renew plan"
                            className="bg-white/5 hover:bg-royal hover:text-white p-2 rounded-lg size-8 flex items-center justify-center"
                          >
                            <RefreshCw className="size-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleToggleSuspend(m)}
                            title={m.status === "Suspended" ? "Restore Membership" : "Suspend Membership"}
                            className={`p-2 rounded-lg size-8 flex items-center justify-center ${
                              m.status === "Suspended" 
                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500" 
                                : "bg-white/5 hover:bg-royal hover:text-white"
                            }`}
                          >
                            <UserMinus className="size-3.5" />
                          </Button>
                          <Button
                            onClick={() => { setSelectedMember(m); setModals((md) => ({ ...md, delete: true })); }}
                            title="Delete Member"
                            className="bg-white/5 hover:bg-rose-600 hover:text-white p-2 rounded-lg size-8 flex items-center justify-center text-rose-400"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No members match search query filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. PAGINATION BLOCK */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-ink-soft/40 border border-white/5 rounded-xl p-4">
          <span className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} members
          </span>
          <div className="flex gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              variant="outline"
              className="border-white/10 hover:border-white/20 text-white h-9 px-3 text-xs"
            >
              Previous
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              variant="outline"
              className="border-white/10 hover:border-white/20 text-white h-9 px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* --- EDIT MEMBER MODAL --- */}
      <Dialog open={modals.edit} onOpenChange={(o) => !o && setModals((m) => ({ ...m, edit: false }))}>
        <DialogContent className="max-w-md bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <Edit2 className="size-5 text-royal" /> Edit Profile details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Modify details for member: {selectedMember?.fullName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name</label>
              <Input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</label>
                <Input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email Address</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gender</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="h-12 w-full px-4 rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal"
                >
                  <option value="Male" className="bg-ink-soft">Male</option>
                  <option value="Female" className="bg-ink-soft">Female</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Age</label>
                <Input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Height (cm)</label>
                <Input
                  type="number"
                  value={editForm.heightCm}
                  onChange={(e) => setEditForm({ ...editForm, heightCm: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Weight (kg)</label>
                <Input
                  type="number"
                  value={editForm.weightKg}
                  onChange={(e) => setEditForm({ ...editForm, weightKg: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading h-12 mt-2"
            >
              Save Profile Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- RENEW PLAN MODAL --- */}
      <Dialog open={modals.renew} onOpenChange={(o) => !o && setModals((m) => ({ ...m, renew: false }))}>
        <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <RefreshCw className="size-5 text-royal" /> Renew Membership
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select program renew settings for: {selectedMember?.fullName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRenewSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Select Package</label>
              <select
                value={renewForm.planId}
                onChange={(e) => setRenewForm({ ...renewForm, planId: e.target.value })}
                className="h-12 w-full px-4 rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal"
              >
                <option value="weight-training" className="bg-ink-soft">Weight Training</option>
                <option value="weight-cardio" className="bg-ink-soft">WT + Cardio</option>
                <option value="all-in-one" className="bg-ink-soft">All In One</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Duration term</label>
              <select
                value={renewForm.months}
                onChange={(e) => setRenewForm({ ...renewForm, months: e.target.value })}
                className="h-12 w-full px-4 rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal"
              >
                <option value="3" className="bg-ink-soft">3 Months</option>
                <option value="6" className="bg-ink-soft">6 Months</option>
                <option value="12" className="bg-ink-soft">12 Months</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading h-12 mt-2 animate-pulse"
            >
              Confirm Subscription Renewal
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM DELETE MODAL --- */}
      <Dialog open={modals.delete} onOpenChange={(o) => !o && setModals((m) => ({ ...m, delete: false }))}>
        <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <AlertTriangle className="size-5 text-royal" /> Delete Member?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to permanently delete {selectedMember?.fullName} from the database? This action is irreversible and clears all subscription metrics.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => setModals((m) => ({ ...m, delete: false }))}
              variant="outline"
              className="flex-1 border-white/10 hover:border-white/20 text-white h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteMember}
              className="flex-1 bg-royal hover:bg-royal-light text-white font-heading font-semibold h-11 flex items-center justify-center gap-2"
            >
              <Trash2 className="size-4" /> Delete Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
