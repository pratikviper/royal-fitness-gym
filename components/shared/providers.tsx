"use client";

import type { ReactNode } from "react";
import { LenisProvider } from "@/components/shared/lenis-provider";
import { AuthProvider } from "@/lib/auth-context";

/** Root client providers. Add theme/query/auth providers here as they land. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LenisProvider>{children}</LenisProvider>
    </AuthProvider>
  );
}
