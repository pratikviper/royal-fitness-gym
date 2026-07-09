"use client";

import React, { useEffect, useState } from "react";
import { 
  Settings, 
  Database, 
  Save, 
  Instagram, 
  Facebook, 
  Twitter, 
  MapPin, 
  Phone, 
  Clock, 
  Loader2, 
  CheckCircle,
  HelpCircle,
  Building
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { seedDatabase } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Forms state
  const [form, setForm] = useState({
    gymName: "Royal Fitness Elite",
    logoText: "ROYAL FITNESS",
    address: "Royal Heights, 4th Floor, Sector 62, Noida, UP - 201301",
    contactNumber: "+91 98765 43210",
    workingHours: "Mon-Sat: 6:00 AM - 10:00 PM, Sun: 7:00 AM - 12:00 PM",
    socialInstagram: "https://instagram.com/royalfitness",
    socialFacebook: "https://facebook.com/royalfitness",
    socialTwitter: "https://twitter.com/royalfitness",
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      let data: any = null;

      if (db) {
        try {
          const snap = await getDoc(doc(db, "settings", "gym_settings"));
          if (snap.exists()) {
            data = snap.data();
          }
        } catch (e) {
          console.warn("Firestore error reading settings, using local fallback:", e);
          data = loadLocalSettingsFallback();
        }
      } else {
        data = loadLocalSettingsFallback();
      }

      if (data) {
        setForm({
          gymName: data.gymName || "Royal Fitness Elite",
          logoText: data.logoText || "ROYAL FITNESS",
          address: data.address || "",
          contactNumber: data.contactNumber || "",
          workingHours: data.workingHours || "",
          socialInstagram: data.socialInstagram || "",
          socialFacebook: data.socialFacebook || "",
          socialTwitter: data.socialTwitter || "",
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadLocalSettingsFallback = () => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return null;

    const cached = localStorage.getItem("rf_settings");
    return cached ? JSON.parse(cached) : null;
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (db) {
        await setDoc(doc(db, "settings", "gym_settings"), form);
      } else {
        localStorage.setItem("rf_settings", JSON.stringify(form));
      }
      showToast("Gym settings saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save gym settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      await seedDatabase(user.uid);
      showToast("Database seeded successfully with 12 mock members!", "success");
      // Wait a moment and redirect to dashboard home
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } catch (err) {
      console.error(err);
      showToast("Database seeding failed.", "error");
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Loading Settings Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Settings form container */}
      <Card className="glass border-white/5 relative overflow-hidden ring-hairline">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-royal to-royal-light" />
        <CardHeader>
          <CardTitle className="text-base font-heading text-steel uppercase font-bold tracking-wider flex items-center gap-2">
            <Building className="size-4.5 text-royal" /> Gym Profile Settings
          </CardTitle>
          <CardDescription className="text-xs">Configure the general address and schedule metrics.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Gym Name</label>
                <Input
                  type="text"
                  value={form.gymName}
                  onChange={(e) => setForm({ ...form, gymName: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Navbar Logo Text</label>
                <Input
                  type="text"
                  value={form.logoText}
                  onChange={(e) => setForm({ ...form, logoText: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                  <Phone className="size-3 text-muted-foreground" /> Contact Number
                </label>
                <Input
                  type="text"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground" /> Working Hours
                </label>
                <Input
                  type="text"
                  value={form.workingHours}
                  onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                  required
                  className="border-white/10 focus-visible:border-royal"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <MapPin className="size-3 text-muted-foreground" /> Resident Address
              </label>
              <Input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                className="border-white/10 focus-visible:border-royal"
              />
            </div>

            {/* Social media inputs */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <p className="text-[10px] uppercase tracking-wider text-royal font-bold">Social Media Profiles</p>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                    <Instagram className="size-3.5 text-rose-400" /> Instagram Link
                  </label>
                  <Input
                    type="url"
                    value={form.socialInstagram}
                    onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
                    className="border-white/10 focus-visible:border-royal text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                    <Facebook className="size-3.5 text-blue-400" /> Facebook Link
                  </label>
                  <Input
                    type="url"
                    value={form.socialFacebook}
                    onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })}
                    className="border-white/10 focus-visible:border-royal text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
                    <Twitter className="size-3.5 text-sky-400" /> Twitter Link
                  </label>
                  <Input
                    type="url"
                    value={form.socialTwitter}
                    onChange={(e) => setForm({ ...form, socialTwitter: e.target.value })}
                    className="border-white/10 focus-visible:border-royal text-xs"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-royal hover:bg-royal-light text-white font-heading font-semibold h-11 px-6 flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Configurations
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Seeding tools */}
      <Card className="glass border-white/5 relative overflow-hidden ring-hairline border-dashed">
        <CardHeader>
          <CardTitle className="text-base font-heading text-steel uppercase font-bold tracking-wider flex items-center gap-2">
            <Database className="size-4.5 text-royal" /> Developer Tools & Seeding
          </CardTitle>
          <CardDescription className="text-xs">Populate mockup members to run the dashboard ledger.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Clicking the seeder button below logs 12 mock members, active subscription contracts, biographical trends, trainers directory lists, attendance logs, and contact submissions inside the active database environment (Firestore or localStorage fallback).
          </p>

          <Button
            onClick={handleSeedDatabase}
            disabled={seeding}
            variant="outline"
            className="border-royal text-royal hover:bg-royal hover:text-white h-11 px-6 font-heading font-semibold flex items-center gap-2 animate-pulse"
          >
            {seeding ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Seeding database...
              </>
            ) : (
              <>
                <Database className="size-4" /> Seed Demo Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
