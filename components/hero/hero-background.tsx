"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * Full-bleed hero photograph with a slow "Ken Burns" drift and a subtle
 * mouse-parallax. The image already carries the brand (wings + chain motif,
 * embers, smoke) so the 3D FX layer on top stays intentionally minimal.
 */
export function HeroBackground() {
  const reduced = usePrefersReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 20 });
  const sy = useSpring(y, { stiffness: 60, damping: 20 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const relX = e.clientX / window.innerWidth - 0.5;
    const relY = e.clientY / window.innerHeight - 0.5;
    x.set(relX * -24);
    y.set(relY * -16);
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseMove={handleMove}
      aria-hidden
    >
      <motion.div
        style={{ x: sx, y: sy }}
        /* Gentle breathing only (no scale-up) so the full figure is never
           cropped top or bottom. */
        animate={reduced ? {} : { scale: [1, 1.015, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/background.png"
          alt="Athlete training at Royal Fitness"
          fill
          priority
          sizes="100vw"
          quality={85}
          /* Mobile (portrait): cover fills the height and shows the athlete
             head-to-toe, cropping only the sides. Desktop (wide): contain
             shows the whole figure, anchored right so the black, blending
             empty space falls left under the text gradient. */
          className="object-cover object-[72%_center] md:object-contain md:object-right"
        />
      </motion.div>
    </div>
  );
}
