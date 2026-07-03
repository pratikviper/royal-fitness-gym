"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  text: string;
  className?: string;
  /** delay before the animation begins */
  delay?: number;
  /** per-character stagger */
  stagger?: number;
  once?: boolean;
}

/**
 * Character-by-character reveal for headings (words kept intact so they wrap
 * naturally). Each letter rises + fades in with a spring feel.
 */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  once = true,
}: SplitTextProps) {
  const words = text.split(" ");

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
      aria-label={text}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden>
          {word.split("").map((char, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              variants={{
                hidden: { y: "100%", opacity: 0 },
                show: {
                  y: "0%",
                  opacity: 1,
                  transition: { type: "spring", damping: 14, stiffness: 180 },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  );
}
