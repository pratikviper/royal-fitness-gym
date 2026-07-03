"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AngularButtonProps {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}

/**
 * Slanted parallelogram CTA button (matches the hero banner). Built with a
 * skew on the shell + counter-skew on the label so the text stays upright and
 * the border/background follow the angled shape.
 */
export function AngularButton({
  href,
  children,
  variant = "primary",
  className,
}: AngularButtonProps) {
  const base =
    "group relative inline-flex -skew-x-[12deg] items-center justify-center overflow-hidden px-8 py-3.5 text-sm font-bold uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const variants = {
    primary:
      "bg-royal-gradient text-white shadow-glow-soft hover:shadow-glow hover:brightness-110",
    outline:
      "border border-silver/40 text-silver hover:border-royal hover:text-white",
  } as const;

  const body = (
    <>
      <span className="block skew-x-[12deg]">{children}</span>
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[220%]"
        />
      )}
    </>
  );

  const classes = cn(base, variants[variant], className);

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <button type="button" className={classes}>
      {body}
    </button>
  );
}
