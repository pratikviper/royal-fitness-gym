"use client";

import React, { useState } from "react";
import { 
  Dumbbell, 
  Activity, 
  User, 
  KeyRound, 
  Loader2, 
  Check, 
  ShieldAlert, 
  LogOut,
  AlertTriangle
} from "lucide-react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/auth";
import { memberships } from "@/data/memberships";
import { 
  renewMembershipPlan, 
  updateBmiDetails, 
  updateProfileDetails,
  type UserProfileDetails,
  type UserMembership,
  type UserBmiDetails
} from "@/lib/profile-db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- RENEW MEMBERSHIP MODAL ---
interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  onUpdate: (membership: UserMembership) => void;
}

export function RenewMembershipModal({ isOpen, onClose, uid, onUpdate }: RenewModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState("all-in-one");
  const [selectedMonths, setSelectedMonths] = useState(3);
  const [loading, setLoading] = useState(false);
  const [simulationMode, setSimulationMode] = useState<"normal" | "expiring" | "expired">("normal");

  const selectedPlan = memberships.find((m) => m.id === selectedPlanId) || memberships[2];
  const selectedDuration = selectedPlan.durations.find((d) => d.months === selectedMonths) || selectedPlan.durations[0];
  const price = selectedDuration.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let mockUpdated: UserMembership;

      if (simulationMode === "expired") {
        // Creates a membership that expired 2 days ago
        mockUpdated = await renewMembershipPlan(uid, selectedPlan.id, selectedPlan.name, selectedMonths, price, true);
      } else if (simulationMode === "expiring") {
        // Creates a membership with 3 days remaining
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - selectedMonths);
        // Add 3 days from now
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 3);

        const updatedData: UserMembership = {
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          durationMonths: selectedMonths,
          pricePaid: price,
        };

        const isBrowser = typeof window !== "undefined";
        if (auth.currentUser && !localStorage.getItem("rf_current_user")) {
          // If we had a database, we would store it. But locally:
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          if (db) {
            await setDoc(doc(db, "memberships", uid), updatedData);
          }
        }
        if (isBrowser) {
          localStorage.setItem(`rf_membership_${uid}`, JSON.stringify(updatedData));
        }
        mockUpdated = updatedData;
      } else {
        // Normal renewal
        mockUpdated = await renewMembershipPlan(uid, selectedPlan.id, selectedPlan.name, selectedMonths, price);
      }

      onUpdate(mockUpdated);
      // Dispatch storage event to alert other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to renew membership. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-ink-soft border-white/10 text-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
            <Dumbbell className="size-6 text-royal animate-pulse" /> Renew Membership
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a tailored luxury training program and membership duration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Plan Selection */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Select Package</label>
            <div className="grid grid-cols-1 gap-2">
              {memberships.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedPlanId(m.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-300 ${
                    selectedPlanId === m.id
                      ? "border-royal bg-royal/10 shadow-[0_0_12px_rgba(225,29,58,0.15)] text-white"
                      : "border-white/5 bg-white/[0.01] hover:border-white/10 text-white/70"
                  }`}
                >
                  <div>
                    <p className="font-heading font-bold text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.tagline}</p>
                  </div>
                  {selectedPlanId === m.id && <Check className="size-4 text-royal" />}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Select Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {selectedPlan.durations.map((d) => (
                <button
                  key={d.months}
                  type="button"
                  onClick={() => setSelectedMonths(d.months)}
                  className={`py-2 px-3 rounded-lg border font-heading text-xs font-semibold text-center transition-all duration-300 ${
                    selectedMonths === d.months
                      ? "border-royal bg-royal/10 text-white"
                      : "border-white/5 bg-white/[0.01] hover:border-white/10 text-white/60"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seeding State simulation */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <label className="text-xs uppercase tracking-wider text-amber-500 font-semibold flex items-center gap-1">
              <ShieldAlert className="size-3.5" /> Simulation / Test Modes
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["normal", "expiring", "expired"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSimulationMode(mode)}
                  className={`py-1.5 px-2 rounded-lg border text-[10px] uppercase font-bold text-center transition-all duration-300 ${
                    simulationMode === mode
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-white/5 bg-white/[0.01] hover:border-white/10 text-white/40"
                  }`}
                >
                  {mode === "normal" ? "Standard" : mode === "expiring" ? "Expires in 3d" : "Expired"}
                </button>
              ))}
            </div>
          </div>

          {/* Price details and Action Button */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Price</p>
              <p className="font-heading text-2xl font-bold text-white">₹{price.toLocaleString("en-IN")}</p>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-royal hover:bg-royal-light text-white font-semibold font-heading px-6"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Confirm Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- CALCULATE BMI MODAL ---
interface BmiModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  onUpdate: (bmi: UserBmiDetails) => void;
  currentHeight?: number;
  currentWeight?: number;
}

export function CalculateBmiModal({ isOpen, onClose, uid, onUpdate, currentHeight = 175, currentWeight = 70 }: BmiModalProps) {
  const [height, setHeight] = useState(currentHeight.toString());
  const [weight, setWeight] = useState(currentWeight.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || h < 80 || h > 260) {
      setError("Please enter a valid height between 80cm and 260cm.");
      return;
    }
    if (isNaN(w) || w < 25 || w > 400) {
      setError("Please enter a valid weight between 25kg and 400kg.");
      return;
    }

    setLoading(true);
    try {
      const updatedBmi = await updateBmiDetails(uid, h, w);
      onUpdate(updatedBmi);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to calculate BMI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
            <Activity className="size-6 text-royal" /> Calculate BMI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your current biometric values to assess your score.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && <p className="text-xs text-royal font-semibold">{error}</p>}
          
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Height (cm)</label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="178"
              required
              className="border-white/10 focus-visible:border-royal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Weight (kg)</label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="74"
              required
              className="border-white/10 focus-visible:border-royal"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading mt-2 h-12"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Save Metrics"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- UPDATE PROFILE MODAL ---
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  onUpdate: (profile: UserProfileDetails) => void;
  currentName: string;
  currentPhone: string;
}

export function UpdateProfileModal({ isOpen, onClose, uid, onUpdate, currentName, currentPhone }: ProfileModalProps) {
  const [fullName, setFullName] = useState(currentName);
  const [phoneNumber, setPhoneNumber] = useState(currentPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (fullName.trim().length < 2) {
      setError("Please enter a valid full name (2+ characters).");
      return;
    }

    setLoading(true);
    try {
      const updated = await updateProfileDetails(uid, fullName, phoneNumber);
      onUpdate(updated);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
            <User className="size-6 text-royal" /> Edit Profile Details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Keep your account registration contact information current.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && <p className="text-xs text-royal font-semibold">{error}</p>}
          
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="border-white/10 focus-visible:border-royal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="border-white/10 focus-visible:border-royal"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading mt-2 h-12"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- CHANGE PASSWORD MODAL ---
interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  isMock: boolean;
}

export function ChangePasswordModal({ isOpen, onClose, uid, isMock }: PasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (isMock) {
        // Mock password change in localStorage
        const usersJson = localStorage.getItem("rf_users") || "[]";
        const users = JSON.parse(usersJson) as Array<{ uid: string; password?: string }>;
        const userIndex = users.findIndex((u) => u.uid === uid);
        if (userIndex !== -1) {
          if (users[userIndex].password && users[userIndex].password !== oldPassword) {
            throw new Error("Current password is incorrect.");
          }
          users[userIndex].password = newPassword;
          localStorage.setItem("rf_users", JSON.stringify(users));
        } else {
          throw new Error("User record not found in database.");
        }
      } else {
        // Firebase Password change
        const user = auth.currentUser;
        if (!user) throw new Error("No active session. Please log in again.");
        if (user.email) {
          const credential = EmailAuthProvider.credential(user.email, oldPassword);
          await reauthenticateWithCredential(user, credential);
        }
        await updatePassword(user, newPassword);
      }

      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Failed to update password. Verify your current password.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
            <KeyRound className="size-6 text-royal" /> Change Password
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your credentials. Minimum 6 characters.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-emerald-400 space-y-2">
            <Check className="size-12 border-2 border-emerald-500/20 rounded-full p-2 bg-emerald-500/5" />
            <p className="font-heading font-semibold text-center text-sm">Password Updated Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && <p className="text-xs text-royal font-semibold">{error}</p>}
            
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Current Password</label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-royal hover:bg-royal-light text-white font-semibold font-heading mt-2 h-12"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Update Credentials"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- LOGOUT CONFIRMATION MODAL ---
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmationModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading text-steel flex items-center gap-2">
            <AlertTriangle className="size-6 text-royal" /> Exit Dashboard?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Are you sure you want to log out? You will need to log back in to access membership benefits and view metrics.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white/10 hover:border-white/20 text-white h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-royal hover:bg-royal-light hover:shadow-glow text-white h-11 font-heading font-semibold flex items-center justify-center gap-2"
          >
            <LogOut className="size-4" /> Log Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
