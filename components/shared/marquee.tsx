"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/hooks/use-gsap";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface MarqueeProps {
  items: string[];
  className?: string;
  /** base speed in seconds for one loop */
  speed?: number;
}

/**
 * GSAP-powered infinite marquee. The base loop runs continuously; a
 * ScrollTrigger nudges its direction + speed based on scroll velocity for a
 * dynamic, physical feel. Reduced-motion users get a static strip.
 */
export function Marquee({ items, className, speed = 20 }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Loop across half the track (content is duplicated for seamlessness).
      const loop = gsap.to(track, {
        xPercent: -50,
        repeat: -1,
        ease: "none",
        duration: speed,
      });

      // Scroll velocity changes speed + direction.
      const st = ScrollTrigger.create({
        trigger: track,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const dir = self.direction; // 1 down, -1 up
          gsap.to(loop, {
            timeScale: dir * (1 + Math.abs(self.getVelocity()) / 2000),
            duration: 0.3,
            overwrite: true,
          });
        },
      });

      return () => {
        loop.kill();
        st.kill();
      };
    }, track);

    return () => ctx.revert();
  }, [speed]);

  // Duplicate the items so the -50% loop is seamless.
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        "relative flex overflow-hidden border-y border-white/10 py-6",
        className,
      )}
      aria-hidden
    >
      <div ref={trackRef} className="flex shrink-0 gap-8 pr-8">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 whitespace-nowrap font-heading text-3xl uppercase tracking-widest text-metallic md:text-5xl"
          >
            {item}
            <span className="text-royal">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
