"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Loader2, 
  ShieldAlert, 
  X, 
  ShieldX, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Smartphone
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { 
  loginSchema, 
  type LoginValues,
  phoneLoginSchema,
  type PhoneLoginValues 
} from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ConfirmationResult } from "firebase/auth";

type LoginTab = "phone" | "email";

export function LoginForm() {
  const { user, login, sendPhoneOtp, verifyPhoneOtp, isMock, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<LoginTab>("phone");
  const [error, setError] = useState<string | null>(null);

  // Phone Auth State
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Email form
  const emailForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Focus OTP input when moving to OTP step
  useEffect(() => {
    if (phoneStep === "otp") {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [phoneStep]);

  // Handle Email submission
  async function onEmailSubmit(values: LoginValues) {
    setError(null);
    try {
      await login(values.email, values.password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password. Please try again.");
    }
  }

  // Handle Send Phone OTP
  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    const cleanNumber = phoneNumber.trim();
    if (!cleanNumber || cleanNumber.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSendingOtp(true);
    try {
      const result = await sendPhoneOtp(cleanNumber, "login-recaptcha-container");
      setConfirmationResult(result);
      setPhoneStep("otp");
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please check the number and try again.");
    } finally {
      setSendingOtp(false);
    }
  }

  // Handle Verify Phone OTP
  async function handleVerifyOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    if (!confirmationResult) {
      setError("Session expired. Please request a new OTP.");
      setPhoneStep("phone");
      return;
    }

    setVerifyingOtp(true);
    try {
      await verifyPhoneOtp(confirmationResult, cleanOtp);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired OTP code.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  // Handle Resend OTP
  async function handleResendOtp() {
    if (resendCooldown > 0 || sendingOtp) return;
    setOtpCode("");
    await handleSendOtp();
  }

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-royal" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Hidden container for invisible reCAPTCHA */}
      <div id="login-recaptcha-container" />

      {isMock && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-400">
          <ShieldAlert className="size-5 shrink-0 text-yellow-500" />
          <div>
            <p className="font-semibold">Mock Database Mode Active</p>
            <p className="text-xs text-yellow-500/70">
              Firebase credentials are not configured. For Phone OTP, enter any 10-digit number and use code <b>123456</b>.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-4 py-4 text-sm text-red-300 overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-red-400 to-red-600" />
            <div className="mt-0.5 shrink-0 rounded-full border border-red-500/40 bg-red-500/15 p-1.5">
              <ShieldX className="size-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-300 text-xs uppercase tracking-wider mb-0.5">Authentication Notice</p>
              <p className="text-red-300/90 text-sm leading-snug">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="shrink-0 mt-0.5 rounded-full p-1 text-red-400/60 hover:text-red-300 hover:bg-red-500/20 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Segmented Tab Switcher */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            setActiveTab("phone");
            setError(null);
          }}
          className={`relative flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "phone"
              ? "bg-royal text-white shadow-lg shadow-royal/30"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Phone className="size-4" />
          <span>Mobile Phone</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("email");
            setError(null);
          }}
          className={`relative flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "email"
              ? "bg-royal text-white shadow-lg shadow-royal/30"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          <Mail className="size-4" />
          <span>Email & Password</span>
        </button>
      </div>

      {/* ── TAB 1: PHONE LOGIN ── */}
      {activeTab === "phone" && (
        <div className="glass space-y-5 rounded-2xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            {phoneStep === "phone" ? (
              <motion.form
                key="step-phone"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSendOtp}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Smartphone className="size-3.5 text-royal" /> Mobile Phone Number
                    </label>
                    <span className="text-[11px] text-muted-foreground">Country: India (+91)</span>
                  </div>

                  <div className="flex items-center rounded-xl bg-white/5 border border-white/10 focus-within:border-royal transition-colors overflow-hidden">
                    <div className="flex items-center gap-1 px-3.5 py-3 border-r border-white/10 bg-white/[0.03] text-sm font-medium text-white select-none">
                      <span className="text-base">🇮🇳</span>
                      <span className="text-xs text-muted-foreground font-mono">+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder:text-muted-foreground outline-none font-medium"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    We will send a 6-digit SMS verification code to verify your phone.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-royal hover:bg-royal-light text-white font-bold tracking-wide"
                  disabled={sendingOtp || !phoneNumber.trim()}
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Sending OTP SMS...
                    </>
                  ) : (
                    <>
                      Send OTP Code <ArrowRight className="size-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step-otp"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerifyOtp}
                className="space-y-5"
              >
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      Code Sent To
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      {phoneNumber.startsWith("+") ? phoneNumber : `+91 ${phoneNumber}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneStep("phone");
                      setError(null);
                    }}
                    className="text-xs text-royal hover:text-royal-light hover:underline font-semibold"
                  >
                    Change Number
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-royal" /> Enter 6-Digit OTP Code
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="w-full h-14 rounded-xl bg-white/5 border border-white/10 px-4 text-center font-mono text-2xl font-bold tracking-[0.5em] text-white placeholder:text-muted-foreground outline-none focus:border-royal transition-colors"
                  />
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-muted-foreground">Didn&apos;t receive SMS?</span>
                    {resendCooldown > 0 ? (
                      <span className="text-muted-foreground font-mono">
                        Resend in <b className="text-white">{resendCooldown}s</b>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={sendingOtp}
                        className="text-royal hover:text-royal-light font-semibold inline-flex items-center gap-1"
                      >
                        <RotateCcw className="size-3" /> Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-royal hover:bg-royal-light text-white font-bold tracking-wide"
                  disabled={verifyingOtp || otpCode.length !== 6}
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Verifying Code...
                    </>
                  ) : (
                    "Verify & Log In"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── TAB 2: EMAIL & PASSWORD LOGIN ── */}
      {activeTab === "email" && (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="glass space-y-5 rounded-2xl p-6 md:p-8"
            noValidate
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={emailForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full bg-royal hover:bg-royal-light text-white font-bold"
              disabled={emailForm.formState.isSubmitting}
            >
              {emailForm.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Logging in...
                </>
              ) : (
                "Log In with Email"
              )}
            </Button>
          </form>
        </Form>
      )}

      {/* Link to Signup */}
      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-royal hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

