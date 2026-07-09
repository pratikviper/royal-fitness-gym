"use client";

import React, { useEffect, useState } from "react";
import { 
  Award, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Loader2, 
  DollarSign, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

interface GymPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  status: "Active" | "Inactive";
  features: string; // Comma-separated features list
}

export default function AdminPlansPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
  });

  const [selectedPlan, setSelectedPlan] = useState<GymPlan | null>(null);

  // Form states
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "3 Months",
    status: "Active" as "Active" | "Inactive",
    features: "",
  });

  const loadPlans = async () => {
    setLoading(true);
    try {
      let tempPlans: GymPlan[] = [];

      if (db) {
        try {
          const snap = await getDocs(collection(db, "plans_models"));
          snap.forEach((doc) => {
            tempPlans.push(doc.data() as GymPlan);
          });

          // Seed default plans if collection is empty
          if (tempPlans.length === 0) {
            const defaults: GymPlan[] = [
              { id: "weight-training", name: "Weight Training", price: 4500, duration: "3 Months", status: "Active", features: "Gym Access, Weight Floor, Workout Plan, Certified Trainers, Locker facility" },
              { id: "weight-cardio", name: "Weight Training + Cardio", price: 5500, duration: "3 Months", status: "Active", features: "WT Floor, Cardio Access, Functional Training, Group Classes, Nutrition Guidance" },
              { id: "all-in-one", name: "All In One", price: 6500, duration: "3 Months", status: "Active", features: "100% Result Coaching, Personal Trainer, Diet Planning, Group Activities, Priority Support" },
            ];
            for (const d of defaults) {
              await setDoc(doc(db, "plans_models", d.id), d);
              tempPlans.push(d);
            }
          }
        } catch (e) {
          console.warn("Firestore error reading plans, using localStorage fallback:", e);
          tempPlans = loadLocalPlansFallback();
        }
      } else {
        tempPlans = loadLocalPlansFallback();
      }

      setPlans(tempPlans);
    } catch (err) {
      console.error(err);
      showToast("Failed to load plans.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLocalPlansFallback = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return [];

    const cached = localStorage.getItem("rf_plans");
    if (cached) {
      try {
        return JSON.parse(cached) as GymPlan[];
      } catch {
        // Fallback below
      }
    }

    const defaults: GymPlan[] = [
      { id: "weight-training", name: "Weight Training", price: 4500, duration: "3 Months", status: "Active", features: "Gym Access, Weight Floor, Workout Plan, Certified Trainers, Locker facility" },
      { id: "weight-cardio", name: "Weight Training + Cardio", price: 5500, duration: "3 Months", status: "Active", features: "WT Floor, Cardio Access, Functional Training, Group Classes, Nutrition Guidance" },
      { id: "all-in-one", name: "All In One", price: 6500, duration: "3 Months", status: "Active", features: "100% Result Coaching, Personal Trainer, Diet Planning, Group Activities, Priority Support" },
    ];
    localStorage.setItem("rf_plans", JSON.stringify(defaults));
    return defaults;
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreateModal = () => {
    setForm({
      name: "",
      price: "",
      duration: "3 Months",
      status: "Active",
      features: "",
    });
    setModals((m) => ({ ...m, create: true }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const planId = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const parsedPrice = parseFloat(form.price) || 0;

      const newPlan: GymPlan = {
        id: planId,
        name: form.name,
        price: parsedPrice,
        duration: form.duration,
        status: form.status,
        features: form.features,
      };

      if (db) {
        await setDoc(doc(db, "plans_models", planId), newPlan);
      } else {
        const updatedPlans = [...plans, newPlan];
        localStorage.setItem("rf_plans", JSON.stringify(updatedPlans));
      }

      showToast(`Membership plan ${form.name} created!`, "success");
      setModals((m) => ({ ...m, create: false }));
      loadPlans();
    } catch (err) {
      console.error(err);
      showToast("Failed to create membership plan.", "error");
    }
  };

  const openEditModal = (plan: GymPlan) => {
    setSelectedPlan(plan);
    setForm({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration,
      status: plan.status,
      features: plan.features,
    });
    setModals((m) => ({ ...m, edit: true }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      const parsedPrice = parseFloat(form.price) || 0;
      const updatedPlan: GymPlan = {
        ...selectedPlan,
        name: form.name,
        price: parsedPrice,
        duration: form.duration,
        status: form.status,
        features: form.features,
      };

      if (db) {
        await setDoc(doc(db, "plans_models", selectedPlan.id), updatedPlan);
      } else {
        const updatedPlans = plans.map((p) => (p.id === selectedPlan.id ? updatedPlan : p));
        localStorage.setItem("rf_plans", JSON.stringify(updatedPlans));
      }

      showToast(`Membership plan ${form.name} updated!`, "success");
      setModals((m) => ({ ...m, edit: false }));
      loadPlans();
    } catch (err) {
      console.error(err);
      showToast("Failed to update membership plan.", "error");
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "plans_models", selectedPlan.id));
      } else {
        const updatedPlans = plans.filter((p) => p.id !== selectedPlan.id);
        localStorage.setItem("rf_plans", JSON.stringify(updatedPlans));
      }

      showToast("Membership plan deleted.", "success");
      setModals((m) => ({ ...m, delete: false }));
      loadPlans();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete membership plan.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Compiling Gym Packages...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. HEADER ROW */}
      <div className="flex justify-between items-center bg-ink-soft/40 border border-white/5 rounded-2xl p-4">
        <div>
          <p className="text-xs text-muted-foreground">Manage subscriptions and plan descriptions.</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-royal hover:bg-royal-light text-white font-heading font-semibold flex items-center gap-1.5 px-4 h-10"
        >
          <Plus className="size-4" /> Create Plan
        </Button>
      </div>

      {/* 2. PLANS CARDS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => {
          const featureList = p.features.split(",").map((f) => f.trim()).filter(Boolean);
          
          return (
            <Card key={p.id} className="glass border-white/5 overflow-hidden flex flex-col justify-between relative ring-hairline">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-royal to-royal-light" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-heading font-black text-white">{p.name}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="size-3 text-royal-light" /> {p.duration}
                    </CardDescription>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] uppercase tracking-wider font-bold ${
                    p.status === "Active"
                      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                      : "border-rose-500/20 bg-rose-500/5 text-rose-400"
                  }`}>
                    {p.status}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">₹</span>
                  <span className="text-3xl font-heading font-black text-white">{p.price.toLocaleString("en-IN")}</span>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4">
                  <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold">Included Features</p>
                  <ul className="space-y-1.5">
                    {featureList.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-white/70">
                        <Check className="size-3.5 text-royal shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="border-t border-white/5 pt-4 flex gap-2">
                <Button
                  onClick={() => openEditModal(p)}
                  variant="outline"
                  className="flex-1 border-white/10 hover:border-white/20 text-white h-9 text-xs flex items-center justify-center gap-1"
                >
                  <Edit2 className="size-3" /> Edit
                </Button>
                <Button
                  onClick={() => { setSelectedPlan(p); setModals((m) => ({ ...m, delete: true })); }}
                  variant="ghost"
                  className="flex-1 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 h-9 text-xs flex items-center justify-center gap-1"
                >
                  <Trash2 className="size-3" /> Delete
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* --- CREATE PLAN DIALOG --- */}
      <Dialog open={modals.create} onOpenChange={(o) => !o && setModals((m) => ({ ...m, create: false }))}>
        <DialogContent className="max-w-md bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <Plus className="size-5 text-royal" /> Create Subscription Plan
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define the price term metrics for the new package.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Plan Name</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Platinum All Access"
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Price (INR)</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="6500"
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Duration</label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="h-12 w-full px-4 rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal"
                >
                  <option value="3 Months" className="bg-ink-soft">3 Months</option>
                  <option value="6 Months" className="bg-ink-soft">6 Months</option>
                  <option value="12 Months" className="bg-ink-soft">12 Months</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Features (Comma separated)</label>
              <Input
                type="text"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder="Gym floor, cardio zones, locker checkin..."
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Plan Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="h-12 w-full px-4 rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal"
              >
                <option value="Active" className="bg-ink-soft">Active</option>
                <option value="Inactive" className="bg-ink-soft">Inactive</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading h-12 mt-2"
            >
              Create Package Model
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- EDIT PLAN DIALOG --- */}
      <Dialog open={modals.edit} onOpenChange={(o) => !o && setModals((m) => ({ ...m, edit: false }))}>
        <DialogContent className="max-w-md bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <Edit2 className="size-5 text-royal" /> Edit Subscription Plan
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Modify subscription boundaries for package: {selectedPlan?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Plan Name</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Price (INR)</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Duration</label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="h-12 w-full px-4 rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal"
                >
                  <option value="3 Months" className="bg-ink-soft">3 Months</option>
                  <option value="6 Months" className="bg-ink-soft">6 Months</option>
                  <option value="12 Months" className="bg-ink-soft">12 Months</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Features (Comma separated)</label>
              <Input
                type="text"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Plan Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="h-12 w-full px-4 rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal"
              >
                <option value="Active" className="bg-ink-soft">Active</option>
                <option value="Inactive" className="bg-ink-soft">Inactive</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading h-12 mt-2"
            >
              Save Package Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM DELETE PLAN DIALOG --- */}
      <Dialog open={modals.delete} onOpenChange={(o) => !o && setModals((m) => ({ ...m, delete: false }))}>
        <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <AlertTriangle className="size-5 text-royal" /> Delete Plan?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to permanently delete subscription plan {selectedPlan?.name}? This will block new renewals on this plan level.
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
              onClick={handleDeletePlan}
              className="flex-1 bg-royal hover:bg-royal-light text-white font-heading font-semibold h-11 flex items-center justify-center gap-2"
            >
              <Trash2 className="size-4" /> Delete Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
