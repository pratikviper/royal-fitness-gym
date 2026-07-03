"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "fade" | "up" | "down" | "left" | "right" | "scale" | "blur";

const variantMap: Record<RevealVariant, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  up: {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    show: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 60 },
    show: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -60 },
    show: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(14px)", y: 24 },
    show: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
};

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "span" | "li" | "article";
}

/**
 * Scroll-triggered reveal wrapper. Handles fade / slide / scale / blur.
 * Uses `whileInView` so it plays as the element enters the viewport.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  duration = 0.7,
  once = true,
  className,
  as = "div",
}: RevealProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MotionTag = motion[as] as any;
  return (
    <MotionTag
      className={cn("will-reveal", className)}
      variants={variantMap[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Container that staggers its <Reveal> / motion children. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.12,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Child item for StaggerGroup — reads parent variants automatically. */
export function StaggerItem({
  children,
  variant = "up",
  className,
}: {
  children: ReactNode;
  variant?: RevealVariant;
  className?: string;
}) {
  return (
    <motion.div
      className={cn("will-reveal", className)}
      variants={variantMap[variant]}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
