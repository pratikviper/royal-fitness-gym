"use client";

import React, { useEffect, useState } from "react";
import { 
  DollarSign, 
  Clock, 
  AlertOctagon, 
  Check, 
  FileText, 
  Printer, 
  Loader2, 
  Search
} from "lucide-react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";

interface GymPayment {
  invoiceNo: string;
  uid: string;
  planName: string;
  amount: number;
  method: string;
  status: "Paid" | "Pending" | "Failed";
  date: string;
  memberName?: string;
  memberEmail?: string;
  memberId?: string;
}

export default function AdminPaymentsPage() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<GymPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // States for search and tabs
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "Paid" | "Pending" | "Failed">("all");

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<GymPayment | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      let tempPayments: GymPayment[] = [];
      const profiles: Record<string, any> = {};

      if (db) {
        try {
          // Fetch profiles first for name mapping
          const usersSnap = await getDocs(collection(db, "users"));
          usersSnap.forEach((doc) => {
            profiles[doc.id] = doc.data();
          });

          // Fetch payments
          const snap = await getDocs(collection(db, "payments"));
          snap.forEach((doc) => {
            const data = doc.data();
            const prof = profiles[data.uid] || {};
            tempPayments.push({
              invoiceNo: doc.id,
              uid: data.uid,
              planName: data.planName,
              amount: data.amount,
              method: data.method,
              status: data.status,
              date: data.date,
              memberName: prof.fullName || "Unknown Member",
              memberEmail: prof.email || "",
              memberId: prof.membershipId || ""
            });
          });
        } catch (e) {
          console.warn("Firestore payments fetch error, using local fallback:", e);
          tempPayments = loadLocalPaymentsFallback();
        }
      } else {
        tempPayments = loadLocalPaymentsFallback();
      }

      setPayments(tempPayments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error(err);
      showToast("Failed to compile payments ledger.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLocalPaymentsFallback = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return [];

    const payments = JSON.parse(localStorage.getItem("rf_payments") || "[]") as any[];
    
    // Map names from localStorage
    const uidsJson = localStorage.getItem("rf_member_uids") || "[]";
    const uids = JSON.parse(uidsJson) as string[];
    const profiles: Record<string, any> = {};

    uids.forEach((uid) => {
      const cached = localStorage.getItem(`rf_profile_${uid}`);
      if (cached) profiles[uid] = JSON.parse(cached);
    });

    return payments.map((p) => {
      const prof = profiles[p.uid] || {};
      return {
        invoiceNo: p.invoiceNo,
        uid: p.uid,
        planName: p.planName,
        amount: p.amount,
        method: p.method,
        status: p.status,
        date: p.date,
        memberName: prof.fullName || "Unknown Member",
        memberEmail: prof.email || "",
        memberId: prof.membershipId || ""
      };
    });
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleMarkPaid = async (payment: GymPayment) => {
    try {

      if (db) {
        await setDoc(doc(db, "payments", payment.invoiceNo), {
          uid: payment.uid,
          planName: payment.planName,
          amount: payment.amount,
          method: payment.method,
          status: "Paid",
          date: payment.date
        }, { merge: true });
      } else {
        // LocalStorage update
        const cached = localStorage.getItem("rf_payments") || "[]";
        const list = JSON.parse(cached) as any[];
        const updatedList = list.map((item) => 
          item.invoiceNo === payment.invoiceNo ? { ...item, status: "Paid" } : item
        );
        localStorage.setItem("rf_payments", JSON.stringify(updatedList));
      }

      showToast(`Invoice ${payment.invoiceNo} marked as Paid!`, "success");
      loadPayments();
    } catch (err) {
      console.error(err);
      showToast("Failed to update invoice status.", "error");
    }
  };

  const openReceipt = (payment: GymPayment) => {
    setSelectedReceipt(payment);
    setReceiptOpen(true);
  };

  // Print handle
  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Compute payment summary statistics
  const totalRevenue = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const failedCount = payments.filter((p) => p.status === "Failed").length;

  const currentMonthName = new Date().toLocaleString("default", { month: "short" });
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = payments
    .filter((p) => {
      if (p.status !== "Paid" || !p.date) return false;
      const d = new Date(p.date);
      return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.invoiceNo.toLowerCase().includes(search.toLowerCase()) || 
      p.memberName?.toLowerCase().includes(search.toLowerCase()) || 
      p.planName.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = activeTab === "all" || p.status === activeTab;

    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Compiling Transactions...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. REVENUE METRICS CARDS */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Revenue</span>
            <DollarSign className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">₹{totalRevenue.toLocaleString("en-IN")}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Total collected balance</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Revenue ({currentMonthName})</span>
            <DollarSign className="size-4 text-emerald-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">₹{monthlyRevenue.toLocaleString("en-IN")}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Earnings this month</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Pending Balance</span>
            <Clock className="size-4 text-amber-400 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">₹{pendingRevenue.toLocaleString("en-IN")}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Awaiting check clearances</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 ring-hairline">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Failed Payments</span>
            <AlertOctagon className="size-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-black text-white">{failedCount}</div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Declined invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. FILTER & SEARCH HEADER */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-ink-soft/40 border border-white/5 rounded-2xl p-4">
        <div className="flex gap-2 border-b border-white/5 md:border-0 pb-2 md:pb-0 w-full md:w-auto overflow-x-auto">
          {(["all", "Paid", "Pending", "Failed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-9 px-4 rounded-lg text-xs font-heading font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab 
                  ? "bg-royal text-white shadow-glow-soft" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab === "all" ? "All Invoices" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search invoice or member..."
            className="pl-10 border-white/5 focus-visible:border-royal bg-white/[0.01]"
          />
        </div>
      </div>

      {/* 3. PAYMENTS TABLE LIST */}
      <Card className="glass border-white/5 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="py-4 px-4">Invoice Number</th>
                <th className="py-4 px-4">Member Name</th>
                <th className="py-4 px-4">Subscription plan</th>
                <th className="py-4 px-4">Payment Method</th>
                <th className="py-4 px-4">Amount Paid</th>
                <th className="py-4 px-4">Billing Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Receipts</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => {
                  let statusCol = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
                  if (p.status === "Pending") statusCol = "border-amber-500/20 bg-amber-500/5 text-amber-400";
                  else if (p.status === "Failed") statusCol = "border-rose-500/20 bg-rose-500/5 text-rose-400";

                  return (
                    <tr key={p.invoiceNo} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 font-heading font-semibold text-white tracking-widest">{p.invoiceNo}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-white leading-none">{p.memberName}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{p.memberEmail}</p>
                      </td>
                      <td className="py-4 px-4 font-heading font-black text-royal-light uppercase tracking-wider">{p.planName}</td>
                      <td className="py-4 px-4 font-semibold text-white/80">{p.method}</td>
                      <td className="py-4 px-4 font-heading font-bold text-white text-sm">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="py-4 px-4 text-muted-foreground">{p.date}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] uppercase tracking-wider font-bold ${statusCol}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {p.status === "Pending" && (
                            <Button
                              onClick={() => handleMarkPaid(p)}
                              title="Mark Paid"
                              className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white p-2 rounded-lg size-8 flex items-center justify-center transition-colors"
                            >
                              <Check className="size-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => openReceipt(p)}
                            title="Generate Receipt / Invoice"
                            className="bg-white/5 hover:bg-royal hover:text-white p-2 rounded-lg size-8 flex items-center justify-center text-white/70 transition-colors"
                          >
                            <FileText className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No transactions match search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- RECEIPT MODAL DIALOG (PRINTABLE) --- */}
      <Dialog open={receiptOpen} onOpenChange={(o) => !o && setReceiptOpen(false)}>
        <DialogContent className="max-w-md bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          
          {selectedReceipt && (
            <div id="printable-receipt" className="space-y-6 pt-4">
              <DialogHeader className="border-b border-white/5 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl font-heading font-black text-white">ROYAL FITNESS</DialogTitle>
                    <DialogDescription className="text-[9px] uppercase tracking-widest text-royal font-bold mt-1">Elite Club Invoice</DialogDescription>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-[8px] uppercase tracking-wider text-emerald-400 font-bold">
                    {selectedReceipt.status}
                  </span>
                </div>
              </DialogHeader>

              {/* Receipt Details Info */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] uppercase text-muted-foreground font-semibold">Billed To</p>
                    <p className="font-bold text-white mt-1">{selectedReceipt.memberName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{selectedReceipt.memberEmail}</p>
                    <p className="text-[10px] text-muted-foreground font-heading tracking-widest mt-0.5">{selectedReceipt.memberId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase text-muted-foreground font-semibold">Invoice Details</p>
                    <p className="font-heading font-semibold text-white tracking-widest mt-1">{selectedReceipt.invoiceNo}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Date: {selectedReceipt.date}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Method: {selectedReceipt.method}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                  <p className="text-[9px] uppercase text-muted-foreground font-bold">Subscription Program</p>
                  <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 rounded-xl p-3">
                    <span className="font-heading font-bold text-white uppercase text-[11px]">{selectedReceipt.planName}</span>
                    <span className="font-heading font-bold text-white">₹{selectedReceipt.amount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center text-sm font-semibold">
                  <span className="text-muted-foreground">Amount Paid Total</span>
                  <span className="font-heading text-lg font-black text-white">₹{selectedReceipt.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-white/5 pt-6 select-none">
                <Button
                  onClick={() => setReceiptOpen(false)}
                  variant="outline"
                  className="flex-1 border-white/10 hover:border-white/20 text-white h-11 text-xs font-heading font-semibold"
                >
                  Close
                </Button>
                <Button
                  onClick={handlePrintReceipt}
                  className="flex-1 bg-royal hover:bg-royal-light text-white font-heading font-semibold h-11 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Printer className="size-4" /> Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
