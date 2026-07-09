"use client";

import React, { useEffect, useState } from "react";
import { 
  UserCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  Users, 
  Loader2, 
  AlertTriangle,
  Award
} from "lucide-react";
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
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
import { Avatar } from "@/components/shared/avatar";

interface GymTrainer {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
}

interface TrainerAssignmentMember {
  uid: string;
  fullName: string;
  membershipId: string;
  photoURL?: string | null;
  trainerId?: string;
}

export default function AdminTrainersPage() {
  const { showToast } = useToast();
  const [trainers, setTrainers] = useState<GymTrainer[]>([]);
  const [members, setMembers] = useState<TrainerAssignmentMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modals, setModals] = useState({
    create: false,
    edit: false,
    delete: false,
    assign: false,
  });

  const [selectedTrainer, setSelectedTrainer] = useState<GymTrainer | null>(null);

  // Forms state
  const [form, setForm] = useState({
    name: "",
    specialization: "Weight Training",
    phone: "",
    email: "",
  });

  const loadTrainersData = async () => {
    setLoading(true);
    try {
      let tempTrainers: GymTrainer[] = [];
      let tempMembers: TrainerAssignmentMember[] = [];

      if (db) {
        try {
          // Fetch Trainers
          const tSnap = await getDocs(collection(db, "trainers"));
          tSnap.forEach((doc) => {
            tempTrainers.push(doc.data() as GymTrainer);
          });

          // Fetch Members (for assignments list)
          const mSnap = await getDocs(collection(db, "users"));
          mSnap.forEach((doc) => {
            const data = doc.data();
            if (data.role === "member") {
              tempMembers.push({
                uid: doc.id,
                fullName: data.fullName,
                membershipId: data.membershipId || `RF-${doc.id.slice(0, 5)}`,
                photoURL: data.photoURL,
                trainerId: data.trainerId,
              });
            }
          });

          // Seed default trainers if none exist
          if (tempTrainers.length === 0) {
            const defaults: GymTrainer[] = [
              { id: "trainer_1", name: "Rajesh Kumar", specialization: "Weight Training", phone: "+91 98765 00001", email: "rajesh@royalfitness.com" },
              { id: "trainer_2", name: "Sunita Rao", specialization: "Cardio & Conditioning", phone: "+91 98765 00002", email: "sunita@royalfitness.com" },
              { id: "trainer_3", name: "Amit Pathak", specialization: "Personal Coaching", phone: "+91 98765 00003", email: "amit@royalfitness.com" },
            ];
            for (const d of defaults) {
              await setDoc(doc(db, "trainers", d.id), d);
              tempTrainers.push(d);
            }
          }
        } catch (e) {
          console.warn("Firestore trainers read error, using local fallback:", e);
          ({ tempTrainers, tempMembers } = loadLocalTrainersFallback());
        }
      } else {
        ({ tempTrainers, tempMembers } = loadLocalTrainersFallback());
      }

      setTrainers(tempTrainers);
      setMembers(tempMembers);
    } catch (err) {
      console.error(err);
      showToast("Failed to load trainers data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLocalTrainersFallback = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return { tempTrainers: [], tempMembers: [] };

    const tJson = localStorage.getItem("rf_trainers");
    let tempTrainers = tJson ? JSON.parse(tJson) as GymTrainer[] : [];

    if (tempTrainers.length === 0) {
      tempTrainers = [
        { id: "trainer_1", name: "Rajesh Kumar", specialization: "Weight Training", phone: "+91 98765 00001", email: "rajesh@royalfitness.com" },
        { id: "trainer_2", name: "Sunita Rao", specialization: "Cardio & Conditioning", phone: "+91 98765 00002", email: "sunita@royalfitness.com" },
        { id: "trainer_3", name: "Amit Pathak", specialization: "Personal Coaching", phone: "+91 98765 00003", email: "amit@royalfitness.com" },
      ];
      localStorage.setItem("rf_trainers", JSON.stringify(tempTrainers));
    }

    const uidsJson = localStorage.getItem("rf_member_uids") || "[]";
    const uids = JSON.parse(uidsJson) as string[];
    const tempMembers: TrainerAssignmentMember[] = [];

    uids.forEach((uid) => {
      const cached = localStorage.getItem(`rf_profile_${uid}`);
      if (cached) {
        const p = JSON.parse(cached);
        tempMembers.push({
          uid,
          fullName: p.fullName,
          membershipId: p.membershipId,
          photoURL: p.photoURL,
          trainerId: p.trainerId
        });
      }
    });

    return { tempTrainers, tempMembers };
  };

  useEffect(() => {
    loadTrainersData();
  }, []);

  const openCreateModal = () => {
    setForm({
      name: "",
      specialization: "Weight Training",
      phone: "",
      email: "",
    });
    setModals((m) => ({ ...m, create: true }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const trainerId = `trainer_${Date.now()}`;
      const newTrainer: GymTrainer = {
        id: trainerId,
        name: form.name,
        specialization: form.specialization,
        phone: form.phone,
        email: form.email,
      };

      if (db) {
        await setDoc(doc(db, "trainers", trainerId), newTrainer);
      } else {
        const updated = [...trainers, newTrainer];
        localStorage.setItem("rf_trainers", JSON.stringify(updated));
      }

      showToast(`Trainer ${form.name} registered!`, "success");
      setModals((m) => ({ ...m, create: false }));
      loadTrainersData();
    } catch (err) {
      console.error(err);
      showToast("Failed to create trainer entry.", "error");
    }
  };

  const openEditModal = (t: GymTrainer) => {
    setSelectedTrainer(t);
    setForm({
      name: t.name,
      specialization: t.specialization,
      phone: t.phone,
      email: t.email,
    });
    setModals((m) => ({ ...m, edit: true }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;

    try {
      const updatedTrainer: GymTrainer = {
        ...selectedTrainer,
        name: form.name,
        specialization: form.specialization,
        phone: form.phone,
        email: form.email,
      };

      if (db) {
        await setDoc(doc(db, "trainers", selectedTrainer.id), updatedTrainer);
      } else {
        const updated = trainers.map((t) => (t.id === selectedTrainer.id ? updatedTrainer : t));
        localStorage.setItem("rf_trainers", JSON.stringify(updated));
      }

      showToast(`Trainer ${form.name} profile updated!`, "success");
      setModals((m) => ({ ...m, edit: false }));
      loadTrainersData();
    } catch (err) {
      console.error(err);
      showToast("Failed to update trainer profile.", "error");
    }
  };

  const handleDeleteTrainer = async () => {
    if (!selectedTrainer) return;
    try {
      if (db) {
        await deleteDoc(doc(db, "trainers", selectedTrainer.id));
      } else {
        const updated = trainers.filter((t) => t.id !== selectedTrainer.id);
        localStorage.setItem("rf_trainers", JSON.stringify(updated));
      }

      showToast("Trainer record deleted.", "success");
      setModals((m) => ({ ...m, delete: false }));
      loadTrainersData();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete trainer.", "error");
    }
  };

  // Toggle Member Trainer assignment
  const handleToggleAssignment = async (memberUid: string, trainerId: string | undefined) => {
    try {
      let profile: any = {};
      if (db) {
        const snap = await getDoc(doc(db, "users", memberUid));
        profile = snap.exists() ? snap.data() : {};
      } else {
        const cached = localStorage.getItem(`rf_profile_${memberUid}`);
        profile = cached ? JSON.parse(cached) : {};
      }

      const updatedProfile = {
        ...profile,
        trainerId: trainerId || null, // Clear if undefined
      };

      if (db) {
        await setDoc(doc(db, "users", memberUid), updatedProfile, { merge: true });
      } else {
        localStorage.setItem(`rf_profile_${memberUid}`, JSON.stringify(updatedProfile));
      }

      // Update local state instantly
      setMembers((prev) => 
        prev.map((m) => m.uid === memberUid ? { ...m, trainerId } : m)
      );

      showToast(
        trainerId 
          ? "Member assigned to trainer." 
          : "Member unassigned from trainer.", 
        "success"
      );
    } catch (err) {
      console.error(err);
      showToast("Failed to update assignment.", "error");
    }
  };

  const openAssignModal = (trainer: GymTrainer) => {
    setSelectedTrainer(trainer);
    setModals((m) => ({ ...m, assign: true }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Compiling Trainers Directory...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. HEADER ROW */}
      <div className="flex justify-between items-center bg-ink-soft/40 border border-white/5 rounded-2xl p-4">
        <div>
          <p className="text-xs text-muted-foreground">Manage expert coaching specializations.</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-royal hover:bg-royal-light text-white font-heading font-semibold flex items-center gap-1.5 px-4 h-10"
        >
          <Plus className="size-4" /> Add Trainer
        </Button>
      </div>

      {/* 2. TRAINERS CARDS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trainers.map((t) => {
          const assignedMembers = members.filter((m) => m.trainerId === t.id);

          return (
            <Card key={t.id} className="glass border-white/5 overflow-hidden flex flex-col justify-between relative ring-hairline">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-royal to-royal-light" />
              <CardHeader className="pb-3">
                <div>
                  <CardTitle className="text-lg font-heading font-black text-white">{t.name}</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-royal-light tracking-wider mt-1 flex items-center gap-1">
                    <Award className="size-3 text-royal" /> {t.specialization}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-1 flex-1">
                <div className="space-y-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5 text-xs text-white/70">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>{t.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-white/70">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span className="truncate">{t.email}</span>
                  </div>
                </div>

                {/* Assigned Members summary details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                    <span>Assigned Clients</span>
                    <span className="text-white font-black">{assignedMembers.length} Members</span>
                  </div>
                  <div className="flex -space-x-2.5 overflow-hidden py-1">
                    {assignedMembers.slice(0, 5).map((m) => (
                      <Avatar 
                        key={m.uid}
                        size="sm" 
                        src={m.photoURL} 
                        name={m.fullName}
                        className="border-2 border-card size-8" 
                      />
                    ))}
                    {assignedMembers.length > 5 && (
                      <div className="size-8 rounded-full border-2 border-card bg-white/5 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                        +{assignedMembers.length - 5}
                      </div>
                    )}
                    {assignedMembers.length === 0 && (
                      <span className="text-[10px] text-muted-foreground italic">No members assigned.</span>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-white/5 pt-4 flex gap-2">
                <Button
                  onClick={() => openAssignModal(t)}
                  className="flex-1 bg-white/5 hover:bg-royal hover:text-white h-9 text-xs flex items-center justify-center gap-1.5 font-heading font-semibold"
                >
                  <Users className="size-3.5" /> Assign Client
                </Button>
                <div className="flex gap-1">
                  <Button
                    onClick={() => openEditModal(t)}
                    title="Edit Profile"
                    className="bg-white/5 hover:bg-white/10 p-2 rounded-lg size-9 flex items-center justify-center text-white"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    onClick={() => { setSelectedTrainer(t); setModals((m) => ({ ...m, delete: true })); }}
                    title="Delete Trainer"
                    className="bg-white/5 hover:bg-rose-500/10 p-2 rounded-lg size-9 flex items-center justify-center text-rose-400"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* --- ADD TRAINER DIALOG --- */}
      <Dialog open={modals.create} onOpenChange={(o) => !o && setModals((m) => ({ ...m, create: false }))}>
        <DialogContent className="max-w-md bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <Plus className="size-5 text-royal" /> Add Coach Profile
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Register a new trainer profile in the database logs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Vikram Malhotra"
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Specialization</label>
              <select
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="h-12 w-full px-4 rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal"
              >
                <option value="Weight Training" className="bg-ink-soft">Weight Training</option>
                <option value="Cardio & Conditioning" className="bg-ink-soft">Cardio & Conditioning</option>
                <option value="Personal Coaching" className="bg-ink-soft">Personal Coaching</option>
                <option value="Strength & Power" className="bg-ink-soft">Strength & Power</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</label>
                <Input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 99887 76655"
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email Address</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vikram@royalfitness.com"
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading h-12 mt-2"
            >
              Register Trainer Profile
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- EDIT TRAINER DIALOG --- */}
      <Dialog open={modals.edit} onOpenChange={(o) => !o && setModals((m) => ({ ...m, edit: false }))}>
        <DialogContent className="max-w-md bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <Edit2 className="size-5 text-royal" /> Edit Trainer Profile
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Modify specializations for coach: {selectedTrainer?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Specialization</label>
              <select
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="h-12 w-full px-4 rounded-md bg-white/[0.02] border border-white/10 text-white focus:outline-none focus:border-royal"
              >
                <option value="Weight Training" className="bg-ink-soft">Weight Training</option>
                <option value="Cardio & Conditioning" className="bg-ink-soft">Cardio & Conditioning</option>
                <option value="Personal Coaching" className="bg-ink-soft">Personal Coaching</option>
                <option value="Strength & Power" className="bg-ink-soft">Strength & Power</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</label>
                <Input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email Address</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading h-12 mt-2"
            >
              Save Trainer profile
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM DELETE TRAINER DIALOG --- */}
      <Dialog open={modals.delete} onOpenChange={(o) => !o && setModals((m) => ({ ...m, delete: false }))}>
        <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
              <AlertTriangle className="size-5 text-royal" /> Delete Trainer Profile?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete coach {selectedTrainer?.name} from active directories? Members assigned to them will have their assignments cleared.
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
              onClick={handleDeleteTrainer}
              className="flex-1 bg-royal hover:bg-royal-light text-white font-heading font-semibold h-11 flex items-center justify-center gap-2"
            >
              <Trash2 className="size-4" /> Delete Trainer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- ASSIGN CLIENTS MODAL --- */}
      <Dialog open={modals.assign} onOpenChange={(o) => !o && setModals((m) => ({ ...m, assign: false }))}>
        <DialogContent className="max-w-md bg-ink-soft border-white/10 text-white rounded-2xl p-6 flex flex-col max-h-[85vh]">
          <DialogHeader className="pb-3 border-b border-white/5">
            <DialogTitle className="text-xl font-bold font-heading text-steel flex items-center gap-2">
              <Users className="size-5 text-royal" /> Assign Clients
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Assign or unassign gym members for coach: {selectedTrainer?.name}.
            </DialogDescription>
          </DialogHeader>

          {/* Members list layout */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 min-h-[250px] max-h-[450px]">
            {members.map((m) => {
              const isAssignedToThis = m.trainerId === selectedTrainer?.id;
              
              return (
                <div key={m.uid} className="flex justify-between items-center border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" src={m.photoURL} name={m.fullName} />
                    <div>
                      <p className="text-xs font-semibold text-white leading-none">{m.fullName}</p>
                      <p className="text-[9px] text-muted-foreground mt-1">{m.membershipId}</p>
                    </div>
                  </div>
                  
                  {isAssignedToThis ? (
                    <Button
                      onClick={() => handleToggleAssignment(m.uid, undefined)}
                      variant="outline"
                      className="h-8 border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 text-[9px] uppercase font-bold tracking-wider px-3"
                    >
                      Unassign
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleToggleAssignment(m.uid, selectedTrainer?.id)}
                      className="h-8 bg-royal hover:bg-royal-light text-white text-[9px] uppercase font-bold tracking-wider px-3"
                    >
                      Assign
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/5 flex select-none mt-4">
            <Button
              onClick={() => setModals((m) => ({ ...m, assign: false }))}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-heading font-semibold h-11 text-xs"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
