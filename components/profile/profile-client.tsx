"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Dumbbell, 
  Activity, 
  ShieldCheck, 
  LogOut,
  AlertTriangle,
  Loader2,
  Lock,
  PlusCircle,
  TrendingUp,
  RefreshCw,
  Heart,
  Camera
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { 
  getProfileDetails, 
  getMembershipDetails, 
  getBmiDetails,
  uploadUserProfilePhoto,
  deleteUserProfilePhoto,
  type UserProfileDetails,
  type UserMembership,
  type UserBmiDetails
} from "@/lib/profile-db";
import { BmiGauge } from "@/components/forms/bmi-gauge";
import { 
  RenewMembershipModal,
  CalculateBmiModal,
  UpdateProfileModal,
  ChangePasswordModal,
  LogoutConfirmationModal
} from "@/components/profile/profile-modals";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/avatar";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export function ProfileClient() {
  const { user, loading: authLoading, isMock, logout } = useAuth();
  const router = useRouter();

  // State for db details
  const [profile, setProfile] = useState<UserProfileDetails | null>(null);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [bmi, setBmi] = useState<UserBmiDetails | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // File Upload & Preview states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { showToast } = useToast();

  // Modals state
  const [modals, setModals] = useState({
    renew: false,
    bmi: false,
    profile: false,
    password: false,
    logout: false,
    photo: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size exceeds 5MB limit.", "error");
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      showToast("Invalid file type. Please upload a PNG, JPG, or WebP image.", "error");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setModals((m) => ({ ...m, photo: true }));
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile || !profile) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const downloadUrl = await uploadUserProfilePhoto(
        profile.uid,
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      setProfile((prev) => prev ? { ...prev, photoURL: downloadUrl } : null);
      showToast("Profile picture updated successfully!", "success");
      handleCancelPhotoUpload();
    } catch (err) {
      console.error(err);
      showToast("Failed to upload profile picture.", "error");
      setUploading(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!profile) return;
    setUploading(true);
    try {
      await deleteUserProfilePhoto(profile.uid);
      setProfile((prev) => prev ? { ...prev, photoURL: null } : null);
      showToast("Profile picture removed successfully.", "success");
      handleCancelPhotoUpload();
    } catch (err) {
      console.error(err);
      showToast("Failed to remove profile picture.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPhotoUpload = () => {
    setModals((m) => ({ ...m, photo: false }));
    setSelectedFile(null);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load profile/membership/BMI data
  useEffect(() => {
    if (!user) return;

    const loadAllData = async () => {
      setLoadingData(true);
      try {
        const p = await getProfileDetails(user.uid, user.email, user.displayName);
        const m = await getMembershipDetails(user.uid);
        const b = await getBmiDetails(user.uid);
        
        setProfile(p);
        setMembership(m);
        setBmi(b);
      } catch (err) {
        console.error("Failed to load user profile details:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadAllData();
  }, [user]);

  // loading spinner
  if (authLoading || !user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Authenticating Session...
        </p>
      </div>
    );
  }

  if (loadingData || !profile || !membership || !bmi) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-royal" />
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          Retrieving Profile Data...
        </p>
      </div>
    );
  }

  // Calculate membership metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(membership.startDate);
  const endDate = new Date(membership.endDate);
  
  const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.round((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const daysUsed = Math.max(0, totalDays - daysRemaining);
  const progressPercent = Math.min(100, Math.max(0, (daysUsed / totalDays) * 100));

  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

  let statusText = "Active";
  let statusColor = "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
  
  if (isExpired) {
    statusText = "Expired";
    statusColor = "border-rose-500/20 bg-rose-500/5 text-rose-400";
  } else if (isExpiringSoon) {
    statusText = "Expiring Soon";
    statusColor = "border-amber-500/20 bg-amber-500/5 text-amber-400";
  }

  // Set BMI helper stats
  const bmiPosition = bmi.bmiScore ? Math.min(1, Math.max(0, (bmi.bmiScore - 15) / 25)) : 0.5;
  let bmiColor = "hsl(142 70% 45%)"; // normal green
  let bmiAdvice = "Maintain your range with balanced workout plans and nutritional support.";

  if (bmi.category === "Underweight") {
    bmiColor = "hsl(200 90% 55%)";
    bmiAdvice = "Focus on calorie-dense nutrition and progressive strength training programs.";
  } else if (bmi.category === "Overweight") {
    bmiColor = "hsl(38 92% 52%)";
    bmiAdvice = "Combine structural strength sessions with active metabolic conditioning.";
  } else if (bmi.category === "Obese") {
    bmiColor = "hsl(351 83% 52%)";
    bmiAdvice = "A structured, coach-led regimen will build safety and consistent progress.";
  }

  const handleLogout = async () => {
    setModals((m) => ({ ...m, logout: false }));
    await logout();
    router.push("/");
  };

  return (
    <>
      <PageHeader
        eyebrow="My Account"
        title="Member Profile"
        description="Monitor status, review metrics, and control account credentials."
      />

      <section className="pb-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* LEFT COLUMN: Header Summary, Quick Actions, Account Info */}
            <div className="space-y-8 lg:col-span-1">
              
              {/* Profile Header Card */}
              <Card className="glass overflow-hidden ring-hairline relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-royal to-royal-light" />
                <CardContent className="pt-8 flex flex-col items-center text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                  />
                  <div 
                    className="relative group cursor-pointer rounded-full transition-transform duration-300 hover:scale-105 active:scale-95"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change Profile Photo"
                  >
                    <Avatar 
                      size="xl" 
                      src={profile.photoURL} 
                      name={profile.fullName} 
                      className="border-2 border-white/15 shadow-glow-soft" 
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full text-white text-[9px] uppercase font-bold tracking-wider select-none">
                      <Camera className="size-4 text-white/90" />
                      <span>Edit Photo</span>
                    </div>

                    <span className={`absolute bottom-0 right-1.5 size-4 rounded-full border-2 border-card z-10 ${
                      isExpired ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                    }`} />
                  </div>

                  <h3 className="mt-4 text-xl font-bold font-heading text-white">{profile.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  
                  <div className="mt-4 flex flex-col items-center gap-1.5 border-t border-white/5 pt-4 w-full">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Membership ID</span>
                    <span className="font-heading text-sm font-bold text-white tracking-widest">{profile.membershipId}</span>
                  </div>

                  <div className="mt-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="glass border-white/5 ring-hairline">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-heading text-steel flex items-center gap-2">
                    <PlusCircle className="size-4 text-royal" /> Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 pt-2">
                  <Button 
                    onClick={() => setModals((m) => ({ ...m, renew: true }))}
                    className="bg-white/5 hover:bg-royal hover:text-white border border-white/5 hover:border-royal text-white/80 rounded-xl h-20 flex flex-col justify-center gap-1.5 transition-all text-xs font-semibold"
                  >
                    <RefreshCw className="size-4" />
                    Renew Plan
                  </Button>
                  <Button 
                    onClick={() => setModals((m) => ({ ...m, bmi: true }))}
                    className="bg-white/5 hover:bg-royal hover:text-white border border-white/5 hover:border-royal text-white/80 rounded-xl h-20 flex flex-col justify-center gap-1.5 transition-all text-xs font-semibold"
                  >
                    <Activity className="size-4" />
                    Recalculate BMI
                  </Button>
                  <Button 
                    onClick={() => setModals((m) => ({ ...m, profile: true }))}
                    className="bg-white/5 hover:bg-royal hover:text-white border border-white/5 hover:border-royal text-white/80 rounded-xl h-20 flex flex-col justify-center gap-1.5 transition-all text-xs font-semibold"
                  >
                    <User className="size-4" />
                    Update Profile
                  </Button>
                  <Button 
                    onClick={() => setModals((m) => ({ ...m, password: true }))}
                    className="bg-white/5 hover:bg-royal hover:text-white border border-white/5 hover:border-royal text-white/80 rounded-xl h-20 flex flex-col justify-center gap-1.5 transition-all text-xs font-semibold"
                  >
                    <Lock className="size-4" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              {/* Account Section Card */}
              <Card className="glass border-white/5 ring-hairline">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-heading text-steel flex items-center gap-2">
                    <ShieldCheck className="size-4 text-royal" /> Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                    <Mail className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Registered Email</p>
                      <p className="text-sm font-medium text-white">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                    <Phone className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Phone Number</p>
                      <p className="text-sm font-medium text-white">{profile.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Joining Date</p>
                      <p className="text-sm font-medium text-white">{profile.joiningDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* RIGHT COLUMN: Membership Card, BMI Card, Logout button */}
            <div className="space-y-8 lg:col-span-2">
              
              {/* Membership details Card */}
              <Card className="glass border-white/5 ring-hairline relative">
                
                {/* Highlight warnings under 7 days or expired */}
                {isExpired && (
                  <div className="bg-rose-500/10 border-b border-rose-500/25 p-4 flex gap-3 text-rose-400 items-start">
                    <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-heading font-semibold text-sm">Membership Expired</p>
                      <p className="text-xs opacity-80 mt-0.5">Your access has been suspended. Please renew your membership plan to continue training.</p>
                    </div>
                  </div>
                )}
                {isExpiringSoon && (
                  <div className="bg-amber-500/10 border-b border-amber-500/25 p-4 flex gap-3 text-amber-400 items-start">
                    <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-heading font-semibold text-sm">Renewal Imminent</p>
                      <p className="text-xs opacity-80 mt-0.5">Your membership expires in {daysRemaining} days. Renew now to avoid training interruptions.</p>
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-heading text-steel flex items-center gap-2">
                        <Dumbbell className="size-5 text-royal" /> Current Membership
                      </CardTitle>
                      <CardDescription>Review subscription durations and plan validity.</CardDescription>
                    </div>
                    <Badge className={`border uppercase text-[10px] tracking-widest px-2.5 py-0.5 ${statusColor}`}>
                      {statusText}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Highlight Plan display */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-[10px] uppercase text-royal font-bold tracking-widest">Active Plan</p>
                      <h4 className="font-heading text-2xl font-black text-white mt-1">{membership.planName}</h4>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Total Term</p>
                        <p className="font-heading text-lg font-bold text-white mt-0.5">{membership.durationMonths} Months</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Paid Amount</p>
                        <p className="font-heading text-lg font-bold text-white mt-0.5">₹{membership.pricePaid.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Start Date</p>
                      <p className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-royal" /> {membership.startDate}
                      </p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Expiry Date</p>
                      <p className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-royal" /> {membership.endDate}
                      </p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Total Duration</p>
                      <p className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                        <Clock className="size-3.5 text-royal" /> {totalDays} Days
                      </p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Days Remaining</p>
                      <p className={`text-sm font-bold mt-1 flex items-center gap-1.5 ${
                        isExpired ? "text-rose-400" : isExpiringSoon ? "text-amber-400" : "text-white"
                      }`}>
                        <Clock className="size-3.5 text-royal animate-pulse" /> {daysRemaining} Days
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                      <span>Plan Consumption Progress</span>
                      <span className={isExpired ? "text-rose-400" : "text-white"}>
                        {isExpired ? "100" : progressPercent.toFixed(0)}% Used
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${
                          isExpired 
                            ? "bg-gradient-to-r from-rose-600 to-rose-400" 
                            : isExpiringSoon 
                              ? "bg-gradient-to-r from-amber-600 to-amber-400" 
                              : "bg-gradient-to-r from-royal to-royal-light"
                        }`}
                        style={{ width: `${isExpired ? 100 : progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Renew button conditional layouts */}
                  {isExpired && (
                    <Button 
                      onClick={() => setModals((m) => ({ ...m, renew: true }))}
                      size="lg"
                      className="w-full bg-royal hover:bg-royal-light text-white font-heading font-black tracking-widest mt-2 h-14"
                    >
                      Renew Now
                    </Button>
                  )}
                  {isExpiringSoon && (
                    <Button 
                      onClick={() => setModals((m) => ({ ...m, renew: true }))}
                      size="lg"
                      className="w-full bg-royal hover:bg-royal-light text-white font-heading font-black tracking-widest mt-2 h-14"
                    >
                      Renew Membership
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* BMI Card */}
              <Card className="glass border-white/5 ring-hairline">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-steel flex items-center gap-2">
                    <Activity className="size-5 text-royal" /> Biometric Analysis (BMI)
                  </CardTitle>
                  <CardDescription>Understand your body composition index and guidance.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8 md:grid-cols-5 items-center">
                  
                  {/* Gauge */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <BmiGauge
                      position={bmiPosition}
                      color={bmiColor}
                      value={bmi.bmiScore}
                      category={bmi.category}
                    />
                  </div>

                  {/* details */}
                  <div className="md:col-span-3 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3">
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Recorded Weight</p>
                        <p className="text-lg font-heading font-bold text-white mt-1">{bmi.weightKg} kg</p>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3">
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Recorded Height</p>
                        <p className="text-lg font-heading font-bold text-white mt-1">{bmi.heightCm} cm</p>
                      </div>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-2">
                      <h5 className="text-xs uppercase font-bold text-royal tracking-widest flex items-center gap-1.5">
                        <Heart className="size-3.5 text-royal" /> Expert Health Advice
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">{bmiAdvice}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/5 pt-3">
                      <span>Calculated On: <span className="text-white font-medium">{bmi.calculatedAt}</span></span>
                      <Button 
                        onClick={() => setModals((m) => ({ ...m, bmi: true }))}
                        variant="link" 
                        className="text-royal hover:underline p-0 h-auto font-semibold flex items-center gap-1"
                      >
                        <TrendingUp className="size-3.5" /> Re-Assess Metrics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logout Card */}
              <div className="border-t border-white/10 pt-6 flex justify-end">
                <Button
                  onClick={() => setModals((m) => ({ ...m, logout: true }))}
                  variant="outline"
                  className="border-royal/30 hover:border-royal text-royal-light hover:text-white bg-transparent h-12 px-6 rounded-full font-heading font-semibold flex items-center gap-2 hover:bg-royal/5 transition-all duration-300"
                >
                  <LogOut className="size-4" /> Sign Out from Dashboard
                </Button>
              </div>

            </div>
          </div>
        </Container>
      </section>

      {/* POPUP MODALS */}
      <RenewMembershipModal
        isOpen={modals.renew}
        onClose={() => setModals((m) => ({ ...m, renew: false }))}
        uid={user.uid}
        onUpdate={(updated) => setMembership(updated)}
      />

      <CalculateBmiModal
        isOpen={modals.bmi}
        onClose={() => setModals((m) => ({ ...m, bmi: false }))}
        uid={user.uid}
        onUpdate={(updated) => setBmi(updated)}
        currentHeight={bmi.heightCm}
        currentWeight={bmi.weightKg}
      />

      <UpdateProfileModal
        isOpen={modals.profile}
        onClose={() => setModals((m) => ({ ...m, profile: false }))}
        uid={user.uid}
        onUpdate={(updated) => setProfile(updated)}
        currentName={profile.fullName}
        currentPhone={profile.phoneNumber}
      />

      <ChangePasswordModal
        isOpen={modals.password}
        onClose={() => setModals((m) => ({ ...m, password: false }))}
        uid={user.uid}
        isMock={isMock}
      />

      <LogoutConfirmationModal
        isOpen={modals.logout}
        onClose={() => setModals((m) => ({ ...m, logout: false }))}
        onConfirm={handleLogout}
      />

      {/* UPDATE PHOTO WORKFLOW DIALOG */}
      <Dialog open={modals.photo} onOpenChange={(o) => !o && handleCancelPhotoUpload()}>
        <DialogContent className="max-w-sm bg-ink-soft border-white/10 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading text-steel flex items-center gap-2">
              <Camera className="size-5 text-royal" /> Profile Picture
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Preview, change, or remove your profile picture.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col items-center justify-center gap-5">
            {previewImage ? (
              <div className="relative size-32 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 shadow-glow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="size-32 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shadow-glow-soft">
                <span className="text-muted-foreground text-xs">No image selected</span>
              </div>
            )}

            {uploading && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Uploading picture...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-royal-gradient transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="w-full flex flex-col gap-2 mt-2">
              {previewImage && !uploading && (
                <Button
                  onClick={handlePhotoUpload}
                  className="w-full bg-royal hover:bg-royal-light text-white font-heading font-semibold h-11"
                >
                  Save Photo
                </Button>
              )}

              {profile.photoURL && !uploading && (
                <Button
                  onClick={handlePhotoDelete}
                  variant="outline"
                  className="w-full border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 h-11 font-heading font-semibold"
                >
                  Remove Photo
                </Button>
              )}

              <Button
                onClick={handleCancelPhotoUpload}
                disabled={uploading}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
