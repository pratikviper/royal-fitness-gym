"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin royal-red progress bar pinned to the top of the viewport. */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-royal-gradient"
      aria-hidden
    />
  );
}
