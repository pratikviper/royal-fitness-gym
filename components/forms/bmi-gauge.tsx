"use client";

import { motion } from "framer-motion";

/**
 * Semicircular BMI gauge. `position` is 0–1 across the arc (left→right).
 * The colored track shows the four BMI bands; the needle animates to position.
 */
export function BmiGauge({
  position,
  color,
  value,
  category,
}: {
  position: number;
  color: string;
  value: number | null;
  category: string | null;
}) {
  // Needle angle: -90deg (left) to +90deg (right).
  const angle = -90 + position * 180;

  // Arc band definitions (share the 180° sweep). Colors match lib/bmi.ts.
  const bands = [
    { color: "hsl(200 90% 55%)", dash: "18 82" }, // underweight
    { color: "hsl(142 70% 45%)", dash: "22 78" }, // normal
    { color: "hsl(38 92% 52%)", dash: "18 82" }, // overweight
    { color: "hsl(351 83% 52%)", dash: "30 70" }, // obese
  ];

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Base track */}
        <path
          d="M 15 105 A 85 85 0 0 1 185 105"
          fill="none"
          stroke="hsl(0 0% 18%)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Colored bands drawn as offset dash segments */}
        {bands.map((band, i) => (
          <path
            key={i}
            d="M 15 105 A 85 85 0 0 1 185 105"
            fill="none"
            stroke={band.color}
            strokeWidth="14"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={band.dash}
            strokeDashoffset={-i * 25}
            opacity={0.85}
          />
        ))}

        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 12 }}
          style={{ transformOrigin: "100px 105px" }}
        >
          <line
            x1="100"
            y1="105"
            x2="100"
            y2="35"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="105" r="8" fill={color} />
        </motion.g>
      </svg>

      {/* Readout */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 text-center">
        <div className="font-heading text-5xl text-metallic">
          {value !== null ? value : "—"}
        </div>
        <div
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: value !== null ? color : "hsl(0 0% 45%)" }}
        >
          {category ?? "Enter details"}
        </div>
      </div>
    </div>
  );
}
