"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * SSR-safe layout effect — use for GSAP setup that must run before paint on
 * the client, without React's server-side warning.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
