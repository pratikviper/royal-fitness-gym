"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/auth";
import { getProfileDetails } from "@/lib/profile-db";

export interface User {
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isMock: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, containerId?: string) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (confirmationResult: ConfirmationResult, code: string, name?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const checkFirebaseConfigured = (): boolean => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return !!(apiKey && apiKey !== "YOUR_API_KEY" && !apiKey.startsWith("YOUR_"));
};

/** Normalizes phone numbers into E.164 international format (defaulting to +91 for 10-digit numbers). */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.trim().replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  // If 10 digits (typical Indian mobile), prepend +91
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  // If starts with 0 and followed by 10 digits
  if (/^0\d{10}$/.test(cleaned)) {
    return `+91${cleaned.slice(1)}`;
  }
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebase, setIsFirebase] = useState(false);

  useEffect(() => {
    const configured = checkFirebaseConfigured();
    setIsFirebase(configured);

    if (configured) {
      try {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              phoneNumber: firebaseUser.phoneNumber,
              displayName: firebaseUser.displayName,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Firebase auth subscription failed, falling back to mock mode:", error);
        initializeMockAuth();
      }
    } else {
      initializeMockAuth();
    }
  }, []);

  const initializeMockAuth = () => {
    setIsFirebase(false);
    const currentMockUser = localStorage.getItem("rf_current_user");
    if (currentMockUser) {
      try {
        setUser(JSON.parse(currentMockUser));
      } catch {
        localStorage.removeItem("rf_current_user");
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isFirebase) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          displayName: fbUser.displayName,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const usersJson = localStorage.getItem("rf_users") || "[]";
        const users = JSON.parse(usersJson) as Array<User & { password?: string }>;
        const matchedUser = users.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!matchedUser) {
          throw new Error("Invalid email or password.");
        }

        const authenticatedUser: User = {
          uid: matchedUser.uid,
          email: matchedUser.email,
          phoneNumber: matchedUser.phoneNumber || null,
          displayName: matchedUser.displayName,
        };

        localStorage.setItem("rf_current_user", JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      if (isFirebase) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        
        await updateProfile(fbUser, { displayName: name });
        try {
          await getProfileDetails(fbUser.uid, fbUser.email, name);
        } catch (e) {
          console.warn("Failed to initialize user document:", e);
        }
        
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          displayName: name,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const usersJson = localStorage.getItem("rf_users") || "[]";
        const users = JSON.parse(usersJson) as Array<User & { password?: string }>;

        if (users.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
          throw new Error("An account with this email already exists.");
        }

        const newMockUser = {
          uid: Math.random().toString(36).substring(2, 11),
          email,
          phoneNumber: null,
          displayName: name,
          password,
        };

        users.push(newMockUser);
        localStorage.setItem("rf_users", JSON.stringify(users));

        const authenticatedUser: User = {
          uid: newMockUser.uid,
          email: newMockUser.email,
          phoneNumber: null,
          displayName: newMockUser.displayName,
        };

        localStorage.setItem("rf_current_user", JSON.stringify(authenticatedUser));
        setUser(authenticatedUser);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneOtp = async (
    phoneNumber: string, 
    containerId: string = "recaptcha-container"
  ): Promise<ConfirmationResult> => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone || formattedPhone.length < 8) {
      throw new Error("Please enter a valid phone number with country code.");
    }

    if (!isFirebase) {
      // Mock mode implementation
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        verificationId: "mock_verification_id_" + Date.now(),
        confirm: async (verificationCode: string) => {
          if (verificationCode !== "123456" && verificationCode.length !== 6) {
            throw new Error("Invalid OTP code. In mock mode, please enter 123456.");
          }
          const usersJson = localStorage.getItem("rf_users") || "[]";
          const users = JSON.parse(usersJson) as Array<User & { phoneNumber?: string }>;
          let matchedUser = users.find((u) => u.phoneNumber === formattedPhone);
          if (!matchedUser) {
            matchedUser = {
              uid: "mock_phone_" + Math.random().toString(36).substring(2, 11),
              email: null,
              phoneNumber: formattedPhone,
              displayName: "Gym Member",
            };
            users.push(matchedUser);
            localStorage.setItem("rf_users", JSON.stringify(users));
          }
          const authenticatedUser: User = {
            uid: matchedUser.uid,
            email: matchedUser.email || null,
            phoneNumber: matchedUser.phoneNumber || formattedPhone,
            displayName: matchedUser.displayName || "Gym Member",
          };
          localStorage.setItem("rf_current_user", JSON.stringify(authenticatedUser));
          setUser(authenticatedUser);
          return { user: authenticatedUser } as any;
        },
      } as unknown as ConfirmationResult;
    }

    if (typeof window === "undefined") {
      throw new Error("Window is not defined.");
    }

    const win = window as any;

    // Reset previous recaptcha verifier if exists
    if (win.__rf_recaptchaVerifier) {
      try {
        win.__rf_recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      win.__rf_recaptchaVerifier = null;
    }

    // Ensure DOM container exists
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }

    try {
      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          // reCAPTCHA expired
        },
      });

      win.__rf_recaptchaVerifier = verifier;

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      return confirmationResult;
    } catch (error: any) {
      if (win.__rf_recaptchaVerifier) {
        try {
          win.__rf_recaptchaVerifier.clear();
        } catch {
          // ignore
        }
        win.__rf_recaptchaVerifier = null;
      }

      console.error("[Phone Auth] sendPhoneOtp error:", error);
      const code = error?.code || "";
      const msg = error?.message || "";

      if (code === "auth/invalid-phone-number") {
        throw new Error("The phone number format is invalid. Please enter a valid 10-digit mobile number.");
      } else if (code === "auth/quota-exceeded") {
        throw new Error("SMS quota for this project has been exceeded. Please try again later or contact support.");
      } else if (code === "auth/too-many-requests") {
        throw new Error("Too many attempts from this device. Please wait a few minutes before trying again.");
      } else if (code === "auth/captcha-check-failed") {
        throw new Error("reCAPTCHA security check failed. Please refresh the page and try again.");
      } else if (code === "auth/operation-not-allowed") {
        throw new Error("Phone authentication is not enabled in Firebase Console. Please verify that Phone provider is enabled in Firebase Console → Authentication → Sign-in method.");
      } else {
        throw new Error(msg || "Failed to send verification SMS. Please check the number and try again.");
      }
    }
  };

  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    code: string,
    name?: string
  ) => {
    setLoading(true);
    try {
      if (!isFirebase) {
        // Mock mode confirm
        await confirmationResult.confirm(code);
        if (name) {
          const currentMockUser = localStorage.getItem("rf_current_user");
          if (currentMockUser) {
            const u = JSON.parse(currentMockUser) as User;
            u.displayName = name;
            localStorage.setItem("rf_current_user", JSON.stringify(u));
            setUser(u);
          }
        }
        return;
      }

      const result = await confirmationResult.confirm(code);
      const fbUser = result.user;
      const resolvedName = name || fbUser.displayName || "Gym Member";

      if (name && fbUser.displayName !== name) {
        try {
          await updateProfile(fbUser, { displayName: name });
        } catch (e) {
          console.warn("Failed to update profile displayName:", e);
        }
      }

      try {
        await getProfileDetails(fbUser.uid, fbUser.email, resolvedName, fbUser.phoneNumber);
      } catch (e) {
        console.warn("Failed to initialize user document:", e);
      }

      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        phoneNumber: fbUser.phoneNumber,
        displayName: resolvedName,
      });
    } catch (error: any) {
      console.error("[Phone Auth] verifyPhoneOtp error:", error);
      const code = error?.code || "";
      const msg = error?.message || "";

      if (code === "auth/invalid-verification-code") {
        throw new Error("Invalid verification code. Please check the 6-digit OTP and try again.");
      } else if (code === "auth/code-expired") {
        throw new Error("This verification code has expired. Please request a new OTP.");
      } else {
        throw new Error(msg || "Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebase) {
        await signOut(auth);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 300));
        localStorage.removeItem("rf_current_user");
      }
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isMock: !isFirebase,
        login,
        signUp,
        logout,
        sendPhoneOtp,
        verifyPhoneOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
