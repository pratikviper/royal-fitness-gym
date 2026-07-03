"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Salad } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkoutGenerator } from "@/components/tools/workout-generator";
import { DietGenerator } from "@/components/tools/diet-generator";

const tabs = [
  { id: "workout", label: "Workout Plan", icon: Dumbbell },
  { id: "diet", label: "Diet Plan", icon: Salad },
] as const;

/** Tabbed wrapper switching between the workout and diet generators. */
export function PlanGenerator() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("workout");

  return (
    <div>
      <div className="mx-auto mb-12 flex max-w-md gap-2 rounded-full border border-white/10 bg-white/[0.02] p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors",
              active === t.id
                ? "text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active === t.id && (
              <motion.span
                layoutId="plan-tab"
                className="absolute inset-0 -z-10 rounded-full bg-royal-gradient"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {active === "workout" ? <WorkoutGenerator /> : <DietGenerator />}
    </div>
  );
}
