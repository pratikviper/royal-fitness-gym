"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/shared/container";
import { AngularButton } from "@/components/shared/angular-button";
import { SplitText } from "@/components/shared/split-text";
import { Counter } from "@/components/shared/counter";
import { HeroBackground } from "@/components/hero/hero-background";
import { stats } from "@/data/facilities";

// The 3D FX layer is browser-only → load it on the client, lazily.
const HeroFx = dynamic(
  () => import("@/components/three/hero-fx").then((m) => m.HeroFx),
  { ssr: false },
);

const tagline = ["Strength", "Discipline", "Transformation"];

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-start overflow-hidden py-28 md:items-center md:py-24">
      {/* Layer 0 — photographic background with parallax */}
      <HeroBackground />

      {/* Layer 1 — transparent Three.js dust + embers, mouse-driven camera */}
      <div className="absolute inset-0 z-[1]">
        <HeroFx />
      </div>

      {/* Layer 2 — readability gradients (darken left + bottom for the copy) */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-background via-transparent to-background/40" />

      <Container className="relative z-10">
        <div className="max-w-3xl">
          {/* Headline */}
          <h1 className="text-6xl leading-[0.82] sm:text-7xl md:text-8xl lg:text-[8.5rem]">
            <span className="block text-steel drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)]">
              <SplitText text="Train Like" />
            </span>
            <span className="block -skew-x-[6deg] text-royal-metal drop-shadow-[0_4px_30px_hsl(var(--royal)/0.55)]">
              <SplitText text="Royalty" delay={0.25} />
            </span>
          </h1>

          {/* Divider with glowing spark */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="relative mt-7 h-px w-full max-w-xl origin-left bg-gradient-to-r from-royal via-royal/50 to-transparent"
          >
            <span className="absolute left-1/3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-royal shadow-[0_0_14px_5px_hsl(var(--royal)/0.7)]" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold uppercase tracking-[0.3em] text-silver sm:text-base"
          >
            {tagline.map((word) => (
              <span key={word} className="flex items-center gap-3">
                {word}
                <span className="text-royal">.</span>
              </span>
            ))}
          </motion.p>

          {/* Stat row with icons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="mt-10 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-start gap-2">
                <span className="grid size-11 place-items-center rounded-full border border-royal/60 text-royal">
                  {s.icon && <s.icon className="size-5" />}
                </span>
                <div className="font-heading text-3xl leading-none text-metallic">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[10px] uppercase leading-tight tracking-widest text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.05 }}
            className="mt-11 flex flex-wrap items-center gap-5"
          >
            <AngularButton href="/membership">Join Now</AngularButton>
            <AngularButton href="/contact" variant="outline">
              Book Free Trial
            </AngularButton>
          </motion.div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown className="size-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
