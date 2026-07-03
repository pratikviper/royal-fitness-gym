"use client";

import { motion } from "framer-motion";
import { bmiToPosition } from "@/lib/bmi";

/**
 * Semicircular BMI gauge. `position` is 0–1 across the arc (left→right) on the
 * same BMI_MIN..BMI_MAX scale as the colored bands, so the needle always lands
 * in the band that matches the category. Threshold ticks (18.5 / 25 / 30) are
 * placed at their true positions.
 */
const CX = 100;
const CY = 105;
const R = 85;

// Fraction 0..1 (left→right along the top semicircle) → point on the arc.
function pointAt(f: number) {
  const angle = Math.PI * (1 - f); // 180° at f=0, 0° at f=1
  return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) };
}

function arcPath(f0: number, f1: number) {
  const a = pointAt(f0);
  const b = pointAt(f1);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

// Bands positioned by real BMI thresholds via the shared scale.
const BANDS = [
  { to: 18.5, color: "hsl(200 90% 55%)" }, // Underweight
  { to: 25, color: "hsl(142 70% 45%)" }, // Normal
  { to: 30, color: "hsl(38 92% 52%)" }, // Overweight
  { to: 40, color: "hsl(351 83% 52%)" }, // Obese
];

const TICKS = [18.5, 25, 30];

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
  const angle = -90 + position * 180;

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg viewBox="0 0 200 128" className="w-full">
        {/* Base track */}
        <path
          d={arcPath(0, 1)}
          fill="none"
          stroke="hsl(0 0% 18%)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Colored bands at true BMI thresholds */}
        {BANDS.map((band, i) => {
          const from = i === 0 ? 0 : bmiToPosition(BANDS[i - 1].to);
          const to = bmiToPosition(band.to);
          return (
            <path
              key={band.to}
              d={arcPath(from, to)}
              fill="none"
              stroke={band.color}
              strokeWidth="14"
              strokeLinecap="butt"
              opacity={0.9}
            />
          );
        })}

        {/* Threshold ticks + labels */}
        {TICKS.map((t) => {
          const f = bmiToPosition(t);
          const outer = pointAt(f);
          const inner = {
            x: CX + (R - 9) * Math.cos(Math.PI * (1 - f)),
            y: CY - (R - 9) * Math.sin(Math.PI * (1 - f)),
          };
          const label = {
            x: CX + (R + 9) * Math.cos(Math.PI * (1 - f)),
            y: CY - (R + 9) * Math.sin(Math.PI * (1 - f)),
          };
          return (
            <g key={t}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="hsl(0 0% 100% / 0.5)"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={label.y}
                fill="hsl(0 0% 60%)"
                fontSize="6.5"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {t}
              </text>
            </g>
          );
        })}

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
            y2="38"
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
