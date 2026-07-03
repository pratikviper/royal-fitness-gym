"use client";

import { createContext, useContext } from "react";
import type Lenis from "lenis";

/**
 * Context that exposes the shared Lenis instance created in <LenisProvider/>.
 * Components can read it to scroll programmatically (e.g. nav anchor links).
 */
export const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}
