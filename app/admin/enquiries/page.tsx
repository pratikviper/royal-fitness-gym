"use client";

import React, { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Search, 
  Send, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: "Pending" | "Replied";
  reply: string;
}

export default function AdminEnquiriesPage() {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Replied">("all");

  // Reply Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [modals, setModals] = useState({
    reply: false,
    delete: false,
  });

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      let temp: ContactEnquiry[] = [];

      if (db) {
        try {
          const snap = await getDocs(collection(db, "contact_enquiries"));
          snap.forEach((doc) => {
            temp.push({
              id: doc.id,
              ...doc.data()
            } as ContactEnquiry);
          });

          // Seed default enquiries if collection is empty
          if (temp.length === 0) {
            const defaults: ContactEnquiry[] = [
              { id: "enq_1", name: "Rahul Deshmukh", email: "rahul.desh@gmail.com", phone: "+91 99887 76655", message: "Hi, I am interested in the All In One 6-month package. Are personal trainer fees included in it?", date: new Date().toISOString().split("T")[0], status: "Pending", reply: "" },
              { id: "enq_2", name: "Meera Nair", email: "meera.nair@yahoo.com", phone: "+91 99112 23344", message: "Do you have a special ladies batch in the morning? What are the working hours?", date: new Date().toISOString().split("T")[0], status: "Replied", reply: "Hello Meera, yes, we have dedicated sessions and the gym is open from 6:00 AM to 10:00 PM. Check our Contact section." }
            ];
            for (const d of defaults) {
              await setDoc(doc(db, "contact_enquiries", d.id), d);
              temp.push(d);
            }
          }
        } catch (e) {
          console.warn("Firestore enquiries fetch error, using local fallback:", e);
          temp = loadLocalEnquiriesFallback();
        }
      } else {
        temp = loadLocalEnquiriesFallback();
      }

      setEnquiries(temp.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      console.error(err);
      showToast("Failed to compile enquiries thread.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLocalEnquiriesFallback = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return [];

    const cached = localStorage.getItem("rf_enquiries");
    if (cached) {
      try {
        return JSON.parse(cached) as ContactEnquiry[];
      } catch {
        // Fallback below
      }
    }

    const defaults: ContactEnquiry[] = [
      { id: "enq_1", name: "Rahul Deshmukh", email: "rahul.desh@gmail.com", phone: "+91 99887 76655", message: "Hi, I am interested in the All In One 6-month package. Are personal trainer fees included in it?", date: new Date().toISOString().split("T")[0], status: "Pending", reply: "" },
      { id: "enq_2", name: "Meera Nair", email: "meera.nair@yahoo.com", phone: "+91 99112 23344", message: "Do you have a special ladies batch in the morning? What are the working hours?", date: new Date().toISOString().split("T")[0], status: "Replied", reply: "Hello Meera, yes, we have dedicated sessions and the gym is open from 6:00 AM to 10:00 PM. Check our Contact section." }
    ];
    localStorage.setItem("rf_enquiries", JSON.stringify(defaults));
    return defaults;
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const openReplyModal = (e: ContactEnquiry) => {
    setSelectedEnquiry(e);
    setReplyText(e.reply || "");
    setModals((m) => ({ ...m, reply: true }));
  };

  const handleReplySubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (!selectedEnquiry) return;

    try {
      const updated: ContactEnquiry = {
        ...selectedEnquiry,
        status: "Replied",
        reply: replyText
      };

      if (db) {
        await setDoc(doc(db, "contact_enquiries", selectedEnquiry.id), updated);
      } else {
        const cached = localStorage.getItem("rf_enquiries") || "[]";
        const list = JSON.parse(cached) as ContactEnquiry[];
        const updatedList = list.map((item) => 
          item.id === selectedEnquiry.id ? updated : item
        );
        localStorage.setItem("rf_enquiries", JSON.stringify(updatedList));
      }

      showToast(`Reply submitted for ${selectedEnquiry.name}!`, "success");
      setModals((m) => ({ ...m, reply: false }));
      loadEnquiries();
    } catch (err) {
      console.error(err);
      showToast("Failed to submit reply.", "error");
    }
  };

  const handleDeleteEnquiry = async () => {
    if (!selectedEnquiry) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "contact_enquiries", selectedEnquiry.id));
      } else {
        const cached = localStorage.getItem("rf_enquiries") || "[]";
        const list = JSON.parse(cached) as ContactEnquiry[];
        const updatedList = list.filter((item) => item.id !== selectedEnquiry.id);
        localStorage.setItem("rf_enquiries", JSON.stringify(updatedList));
      }

      showToast("Enquiry message deleted.", "success");
      setModals((m) => ({ ...m, delete: false }));
      loadEnquiries();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete enquiry message.", "error");
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch = 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      e.email.toLowerCase().includes(search.toLowerCase()) || 
      e.message.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Compiling Messages...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. FILTER CONTROLS BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-ink-soft/40 border border-white/5 rounded-2xl p-4">
        <div className="flex gap-2 w-full md:w-auto">
          {(["all", "Pending", "Replied"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`h-9 px-4 rounded-lg text-xs font-heading font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === tab 
                  ? "bg-royal text-white shadow-glow-soft" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab === "all" ? "All Threads" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages or names..."
            className="pl-10 border-white/5 focus-visible:border-royal bg-white/[0.01]"
          />
        </div>
      </div>

      {/* 2. ENQUIRIES TABLE GRID */}
      <Card className="glass border-white/5 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Message enquiry</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((e) => {
                  let statusCol = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
                  if (e.status === "Pending") statusCol = "border-rose-500/20 bg-rose-500/5 text-rose-400 animate-pulse";

                  return (
                    <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-white leading-none">{e.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Mail className="size-3" /> {e.email}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Phone className="size-3" /> {e.phone}
                        </p>
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <p className="text-white/80 line-clamp-2 leading-relaxed">{e.message}</p>
                        {e.reply && (
                          <div className="mt-2 bg-royal/5 border border-royal/10 rounded-lg p-2 text-[10px] text-royal-light leading-normal">
                            <strong className="text-white">Admin Reply: </strong> {e.reply}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1"><Calendar className="size-3" /> {e.date}</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] uppercase tracking-wider font-bold ${statusCol}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => openReplyModal(e)}
                            className="bg-white/5 hover:bg-royal hover:text-white h-8 text-[10px] uppercase font-bold tracking-wider px-3 rounded-lg flex items-center gap-1"
                          >
                            <MessageSquare className="size-3 shrink-0" /> Reply
                          </Button>
                          <Button
                            onClick={() => { setSelectedEnquiry(e); setModals((m) => ({ ...m, delete: true })); }}
                            title="Delete thread"
                            className="bg-white/5 hover:bg-rose-600/10 p-2 rounded-lg size-8 flex items-center justify-center text-rose-400"
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
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No enquiries match filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- REPLY MODAL DIALOG --- */}
      <Dialog open={modals.reply} onOpenChange={(o) => !o && setModals((m) => ({ ...m, reply: false }))}>
        <DialogContent className="max-w-md bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading text-steel flex items-center gap-2">
              <MessageSquare className="size-5 text-royal" /> Submit Enquiry Reply
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Draft response for contact thread from {selectedEnquiry?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedEnquiry && (
            <form onSubmit={handleReplySubmit} className="mt-4 space-y-4">
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 text-xs leading-relaxed text-white/70">
                <strong className="text-white block mb-1">User Message:</strong>
                {selectedEnquiry.message}
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Response</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Draft your reply mail or SMS details..."
                  required
                  rows={4}
                  className="w-full p-3 text-xs rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading h-12 flex items-center justify-center gap-1.5"
              >
                <Send className="size-4" /> Send Reply Message
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <Dialog open={modals.delete} onOpenChange={(o) => !o && setModals((m) => ({ ...m, delete: false }))}>
        <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <AlertTriangle className="size-5 text-royal" /> Delete message?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this enquiry from {selectedEnquiry?.name}? This clears the log file.
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
              onClick={handleDeleteEnquiry}
              className="flex-1 bg-royal hover:bg-royal-light text-white font-heading font-semibold h-11 flex items-center justify-center gap-2"
            >
              <Trash2 className="size-4" /> Delete thread
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
