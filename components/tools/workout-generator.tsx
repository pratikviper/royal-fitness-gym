"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Dumbbell, RefreshCw, Sparkles } from "lucide-react";
import { workoutSchema, type WorkoutValues } from "@/lib/validations";
import { generateWorkoutPlan, type WorkoutPlan } from "@/lib/workout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function WorkoutGenerator() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [last, setLast] = useState<WorkoutValues | null>(null);

  const form = useForm<WorkoutValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      goal: undefined,
      level: undefined,
      daysPerWeek: undefined,
    },
  });

  function onSubmit(values: WorkoutValues) {
    setLast(values);
    setPlan(generateWorkoutPlan(values));
  }

  function regenerate() {
    if (last) setPlan(generateWorkoutPlan(last));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
      {/* Inputs */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="glass h-fit space-y-5 rounded-2xl p-6 md:p-8"
          noValidate
        >
          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your goal</FormLabel>
                <FormControl>
                  <Select {...field} value={field.value ?? ""}>
                    <option value="" disabled>
                      Select a goal
                    </option>
                    <option value="muscle">Build Muscle</option>
                    <option value="fatloss">Fat Loss</option>
                    <option value="strength">Strength</option>
                    <option value="fitness">General Fitness</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience level</FormLabel>
                <FormControl>
                  <Select {...field} value={field.value ?? ""}>
                    <option value="" disabled>
                      Select level
                    </option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="daysPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days per week</FormLabel>
                <FormControl>
                  <Select {...field} value={field.value ?? ""}>
                    <option value="" disabled>
                      Select days
                    </option>
                    <option value="3">3 days</option>
                    <option value="4">4 days</option>
                    <option value="5">5 days</option>
                    <option value="6">6 days</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="w-full">
            <Sparkles className="size-4" /> Generate Plan
          </Button>
        </form>
      </Form>

      {/* Result */}
      <div>
        {!plan ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-10 text-center text-muted-foreground">
            <Dumbbell className="mb-3 size-8 text-royal" />
            Choose your goal, level, and schedule to generate a personalized
            weekly workout split.
          </div>
        ) : (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-royal">
                  {plan.split} · {plan.daysPerWeek} days/week
                </p>
                <h3 className="font-heading text-3xl text-metallic">
                  Your Workout Plan
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={regenerate}>
                <RefreshCw className="size-4" /> Shuffle
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {plan.days.map((d, i) => (
                <motion.div
                  key={`${d.day}-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-card p-5"
                >
                  <div className="mb-3 flex items-baseline justify-between border-b border-white/5 pb-2">
                    <span className="font-heading text-xl tracking-wide">
                      {d.day}
                    </span>
                    <span className="text-sm font-semibold text-royal">
                      {d.focus}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {d.exercises.map((ex) => (
                      <li
                        key={ex.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground/85">{ex.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {ex.sets} × {ex.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-royal/20 bg-royal/5 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-royal">
                Coach Tips
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {plan.tips.map((t) => (
                  <li key={t}>• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
