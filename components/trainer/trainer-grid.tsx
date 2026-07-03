"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { trainers, trainerCategories } from "@/data/trainers";
import { TrainerCard } from "@/components/trainer/trainer-card";
import { cn } from "@/lib/utils";

/** Trainer grid filterable by category (All / Senior / Junior). */
export function TrainerGrid() {
  const [active, setActive] =
    useState<(typeof trainerCategories)[number]>("All");

  const filtered =
    active === "All"
      ? trainers
      : trainers.filter((t) => t.category === active);

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {trainerCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              "relative rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors",
              active === cat
                ? "border-royal text-white"
                : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            {active === cat && (
              <motion.span
                layoutId="trainer-filter"
                className="absolute inset-0 -z-10 rounded-full bg-royal/20"
              />
            )}
            {cat === "All" ? "All" : `${cat} Trainers`}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
