"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// --- TYPE INTERFACES ---
interface DataPoint {
  label: string;
  value: number;
}

// --- 1. MEMBERSHIP GROWTH (LINE/AREA SVG CHART) ---
export function MembershipGrowthChart({ data = [] }: { data?: DataPoint[] }) {
  const points = data.length > 0 ? data : [
    { label: "Feb", value: 3 },
    { label: "Mar", value: 5 },
    { label: "Apr", value: 8 },
    { label: "May", value: 9 },
    { label: "Jun", value: 11 },
    { label: "Jul", value: 12 },
  ];

  const maxVal = Math.max(...points.map((p) => p.value), 10);
  const width = 500;
  const height = 180;
  const padding = 25;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Convert data points to SVG coordinates
  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * chartWidth;
    const y = padding + chartHeight - (p.value / maxVal) * chartHeight;
    return { x, y, label: p.label, value: p.value };
  });

  // Build SVG Path string
  let linePath = "";
  let areaPath = "";

  if (coords.length > 0) {
    linePath = `M ${coords[0].x} ${coords[0].y}`;
    // Draw straight line segments for modern look
    for (let i = 1; i < coords.length; i++) {
      linePath += ` L ${coords[i].x} ${coords[i].y}`;
    }

    // Area path needs to close the polygon at the bottom
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padding + chartHeight} L ${coords[0].x} ${padding + chartHeight} Z`;
  }

  const [hoveredPoint, setHoveredPoint] = useState<typeof coords[0] | null>(null);

  return (
    <div className="relative w-full h-[230px] rounded-xl bg-white/[0.01] border border-white/5 p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Membership Growth</h4>
        {hoveredPoint && (
          <span className="text-xs font-semibold text-royal-light animate-fade-in">
            {hoveredPoint.label}: <strong className="text-white font-bold">{hoveredPoint.value} Members</strong>
          </span>
        )}
      </div>

      <div className="relative flex-1 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--royal))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--royal))" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = padding + r * chartHeight;
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Path */}
          {areaPath && (
            <motion.path
              d={areaPath}
              fill="url(#areaGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Line Path */}
          {linePath && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="hsl(var(--royal))"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          )}

          {/* Interactive coordinate points */}
          {coords.map((c, i) => (
            <g 
              key={i} 
              onMouseEnter={() => setHoveredPoint(c)} 
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            >
              <circle
                cx={c.x}
                cy={c.y}
                r="4.5"
                fill="hsl(var(--royal-light))"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2.5"
              />
              {/* Invisible larger hover circle */}
              <circle
                cx={c.x}
                cy={c.y}
                r="14"
                fill="transparent"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between px-3 pt-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-t border-white/5">
        {points.map((p, i) => (
          <span key={i}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}

// --- 2. MONTHLY REVENUE (HTML FLEX BARS CHART) ---
export function RevenueChart({ data = [] }: { data?: DataPoint[] }) {
  const points = data.length > 0 ? data : [
    { label: "Feb", value: 31000 },
    { label: "Mar", value: 22000 },
    { label: "Apr", value: 43500 },
    { label: "May", value: 29000 },
    { label: "Jun", value: 48000 },
    { label: "Jul", value: 55000 },
  ];

  const maxVal = Math.max(...points.map((p) => p.value), 10000);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className="w-full h-[230px] rounded-xl bg-white/[0.01] border border-white/5 p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Monthly Revenue</h4>
        {hoveredBar !== null && (
          <span className="text-xs font-semibold text-royal-light">
            ₹{points[hoveredBar].value.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {/* Bar container */}
      <div className="flex-1 flex items-end justify-between gap-4 h-[120px] px-2 relative">
        {points.map((p, i) => {
          const heightPercent = `${(p.value / maxVal) * 100}%`;
          return (
            <div 
              key={i} 
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Dynamic Column Bar */}
              <motion.div
                className="w-full bg-gradient-to-t from-royal-dark via-royal to-royal-light rounded-t-lg shadow-glow-soft hover:shadow-glow group-hover:brightness-110"
                style={{ height: "0%" }}
                animate={{ height: heightPercent }}
                transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.05 }}
              />
            </div>
          );
        })}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between px-3 pt-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-t border-white/5 mt-4">
        {points.map((p, i) => (
          <span key={i} className="flex-1 text-center">{p.label}</span>
        ))}
      </div>
    </div>
  );
}

// --- 3. PLAN DISTRIBUTION (DONUT SVG CHART) ---
export function PlanDistributionChart({ data = [] }: { data?: DataPoint[] }) {
  const points = data.length > 0 ? data : [
    { label: "All In One", value: 5 },
    { label: "WT + Cardio", value: 4 },
    { label: "Weight Training", value: 3 },
  ];

  const total = points.reduce((acc, p) => acc + p.value, 0);
  
  // Render details for plan slices
  const colors = [
    "hsl(var(--royal))",        // Red
    "hsl(210 80% 62%)",       // Silver/Blue
    "hsl(0 0% 82%)",          // Metallic Silver
  ];

  let accumulatedAngle = 0;
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  const slices = points.map((p, i) => {
    const percentage = total > 0 ? p.value / total : 0;
    const dashArray = `${percentage * circumference} ${circumference}`;
    const dashOffset = -accumulatedAngle;
    
    // Accumulate angle (represented as segment offset)
    accumulatedAngle += percentage * circumference;

    return {
      ...p,
      dashArray,
      dashOffset,
      color: colors[i % colors.length],
      pctText: `${(percentage * 100).toFixed(0)}%`,
    };
  });

  const [hoveredSlice, setHoveredSlice] = useState<typeof slices[0] | null>(null);

  return (
    <div className="w-full h-[230px] rounded-xl bg-white/[0.01] border border-white/5 p-4 flex flex-col justify-between">
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Package Share</h4>
      
      <div className="flex-1 grid grid-cols-2 items-center gap-2">
        {/* SVG Circle */}
        <div className="relative flex justify-center items-center">
          <svg viewBox="0 0 130 130" className="size-28 overflow-visible">
            {/* Background ring */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {slices.map((slice, i) => (
              <motion.circle
                key={i}
                cx="65"
                cy="65"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={hoveredSlice?.label === slice.label ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={slice.dashArray}
                strokeDashoffset={slice.dashOffset}
                strokeLinecap="butt"
                style={{ transform: "rotate(-90deg)", transformOrigin: "65px 65px" }}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                className="cursor-pointer transition-all duration-200"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: slice.dashArray }}
                transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
              />
            ))}
          </svg>

          {/* Central text readouts */}
          <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none select-none">
            <span className="font-heading text-lg font-black text-white">
              {hoveredSlice ? hoveredSlice.pctText : total}
            </span>
            <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold leading-none mt-0.5">
              {hoveredSlice ? hoveredSlice.label.substring(0, 10) : "Members"}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {slices.map((slice, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2 text-xs font-semibold cursor-pointer group"
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
              <div className="flex-1 flex justify-between items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="text-white/70 group-hover:text-white truncate">{slice.label}</span>
                <span className="text-white font-bold">{slice.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
