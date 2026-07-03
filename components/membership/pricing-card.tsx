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
import { formatCurrency, cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

const inr = (amount: number) => formatCurrency(amount, "INR", "en-IN");

/**
 * Premium package card with 3D tilt, cursor glow, and shine. Shows the three
 * duration options (3 / 6 / 12 months) with INR pricing. The featured package
 * (All In One) is highlighted.
 */
export function PricingCard({ plan }: { plan: MembershipPlan }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(240px circle at ${glowX}% ${glowY}%, ${plan.accent}22, transparent 70%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 8);
    rotateX.set((0.5 - py) * 8);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
  }

  const lastIndex = plan.durations.length - 1;

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
      <motion.span
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
      />

      {plan.featured && (
        <div className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-royal px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          <Crown className="size-3" /> Best Value
        </div>
      )}

      <div className="relative">
        <h3
          className="font-heading text-2xl tracking-wide"
          style={{ color: plan.accent }}
        >
          {plan.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
      </div>

      {/* Duration / price rows */}
      <div className="relative mt-6 space-y-1 rounded-xl border border-white/10 bg-white/[0.02] p-2">
        {plan.durations.map((d, i) => (
          <div
            key={d.label}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2.5",
              i === lastIndex && "bg-white/[0.04]",
            )}
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              {d.label}
              {i === lastIndex && (
                <span className="rounded-full bg-royal/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-royal">
                  Best
                </span>
              )}
            </span>
            <span className="font-heading text-2xl text-metallic">
              {inr(d.price)}
            </span>
          </div>
        ))}
      </div>

      <ul className="relative mt-6 flex-1 space-y-3">
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
          Enquire Now
        </AnimatedButton>
      </div>
    </motion.div>
  );
}
