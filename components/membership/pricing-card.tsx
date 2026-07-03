"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Check, Crown } from "lucide-react";
import type { MembershipPlan } from "@/types";
import { AnimatedButton } from "@/components/shared/animated-button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * Premium pricing card with 3D tilt (mouse-tracked), a cursor-following glow,
 * a shine sweep, and highlighted styling for the featured (Diamond) plan.
 */
export function PricingCard({ plan }: { plan: MembershipPlan }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Tilt
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  // Glow position
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(240px circle at ${glowX}% ${glowY}%, ${plan.accent}22, transparent 70%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 10);
    rotateX.set((0.5 - py) * 10);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border p-7 [transform-style:preserve-3d]",
        plan.featured
          ? "border-royal/50 bg-gradient-to-b from-royal/10 to-card shadow-glow-soft"
          : "border-white/10 bg-card",
      )}
    >
      {/* Cursor glow */}
      <motion.span
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {/* Shine sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
      />

      {plan.featured && (
        <div className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-royal px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          <Crown className="size-3" /> Most Popular
        </div>
      )}

      <div className="relative">
        <span
          className="text-xs font-bold uppercase tracking-[0.3em]"
          style={{ color: plan.accent }}
        >
          {plan.tier}
        </span>
        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

        <div className="mt-6 flex items-end gap-1">
          <span className="font-heading text-6xl text-metallic">
            {formatCurrency(plan.price)}
          </span>
          <span className="mb-2 text-sm text-muted-foreground">
            {plan.period}
          </span>
        </div>
      </div>

      <ul className="relative mt-7 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: `${plan.accent}22` }}
            >
              <Check className="size-3" style={{ color: plan.accent }} />
            </span>
            <span className="text-foreground/85">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-8">
        <AnimatedButton
          href="/contact"
          className="w-full"
          variant={plan.featured ? "default" : "outline"}
          magnetic={false}
          shine={false}
        >
          Choose {plan.tier}
        </AnimatedButton>
      </div>
    </motion.div>
  );
}
