"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/auth";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isMock: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const checkFirebaseConfigured = (): boolean => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return !!(apiKey && apiKey !== "YOUR_API_KEY" && !apiKey.startsWith("YOUR_"));
};

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
        
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
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
          displayName: name,
          password,
        };

        users.push(newMockUser);
        localStorage.setItem("rf_users", JSON.stringify(users));

        const authenticatedUser: User = {
          uid: newMockUser.uid,
          email: newMockUser.email,
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

  const signInWithGoogle = async () => {
    if (!isFirebase) {
      throw new Error("Google Sign-In is only available when Firebase is configured.");
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
      });
    } catch (error: unknown) {
      setLoading(false);
      // Log the raw Firebase error code so it's visible in browser console
      const code = (error as { code?: string })?.code ?? "unknown";
      const msg  = (error as { message?: string })?.message ?? String(error);
      console.error("[Google Sign-In] error code:", code);
      console.error("[Google Sign-In] error message:", msg);

      // Convert Firebase error codes to friendly messages
      if (code === "auth/popup-blocked") {
        throw new Error("Popup was blocked by your browser. Please allow popups for this site and try again.");
      } else if (code === "auth/unauthorized-domain") {
        throw new Error("This domain is not authorized for Google Sign-In. Add it in Firebase Console → Authentication → Settings → Authorized Domains.");
      } else if (code === "auth/operation-not-allowed") {
        throw new Error("Google Sign-In is not enabled. Enable it in Firebase Console → Authentication → Sign-in Method.");
      } else if (code === "auth/popup-closed-by-user") {
        throw new Error("Sign-in popup was closed before completing. Please try again.");
      } else {
        throw new Error(msg || "Google Sign-In failed. Please try again.");
      }
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
        signInWithGoogle,
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
