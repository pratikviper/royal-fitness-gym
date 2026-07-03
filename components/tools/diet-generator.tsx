"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { RefreshCw, Salad, Sparkles } from "lucide-react";
import { dietSchema, type DietValues } from "@/lib/validations";
import { generateDietPlan, type DietPlan } from "@/lib/diet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function DietGenerator() {
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [last, setLast] = useState<DietValues | null>(null);

  const form = useForm<DietValues>({
    resolver: zodResolver(dietSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      height: undefined,
      weight: undefined,
      activity: undefined,
      goal: undefined,
      diet: undefined,
    },
  });

  function onSubmit(values: DietValues) {
    setLast(values);
    setPlan(generateDietPlan(values));
  }

  function regenerate() {
    if (last) setPlan(generateDietPlan(last));
  }

  const macros = plan
    ? [
        { label: "Protein", value: plan.nutrition.protein, color: "hsl(142 70% 45%)" },
        { label: "Carbs", value: plan.nutrition.carbs, color: "hsl(38 92% 52%)" },
        { label: "Fat", value: plan.nutrition.fat, color: "hsl(351 83% 52%)" },
      ]
    : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
      {/* Inputs */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="glass h-fit space-y-5 rounded-2xl p-6 md:p-8"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" placeholder="28" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Select {...field} value={field.value ?? ""}>
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" placeholder="175" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" placeholder="72" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity level</FormLabel>
                <FormControl>
                  <Select {...field} value={field.value ?? ""}>
                    <option value="" disabled>
                      Select activity
                    </option>
                    <option value="sedentary">Sedentary (desk job)</option>
                    <option value="light">Lightly active (1–2 days)</option>
                    <option value="moderate">Moderate (3–4 days)</option>
                    <option value="active">Very active (5–6 days)</option>
                    <option value="athlete">Athlete (2× a day)</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal</FormLabel>
                <FormControl>
                  <Select {...field} value={field.value ?? ""}>
                    <option value="" disabled>
                      Select goal
                    </option>
                    <option value="fatloss">Fat Loss</option>
                    <option value="maintain">Maintain</option>
                    <option value="muscle">Muscle Gain</option>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="diet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diet preference</FormLabel>
                <FormControl>
                  <Select {...field} value={field.value ?? ""}>
                    <option value="" disabled>
                      Select preference
                    </option>
                    <option value="veg">Vegetarian</option>
                    <option value="nonveg">Non-vegetarian</option>
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
            <Salad className="mb-3 size-8 text-royal" />
            Enter your details to get your daily calorie target, macros, and a
            sample meal plan.
          </div>
        ) : (
          <div>
            {/* Summary */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-royal">
                  Daily target
                </p>
                <h3 className="font-heading text-4xl text-metallic">
                  {plan.nutrition.calories.toLocaleString()} kcal
                </h3>
                <p className="text-xs text-muted-foreground">
                  BMR {plan.nutrition.bmr} · TDEE {plan.nutrition.tdee} kcal
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={regenerate}>
                <RefreshCw className="size-4" /> Shuffle meals
              </Button>
            </div>

            {/* Macros */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              {macros.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/10 bg-card p-4 text-center"
                >
                  <div
                    className="font-heading text-3xl"
                    style={{ color: m.color }}
                  >
                    {m.value}g
                  </div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Meals */}
            <div className="space-y-3">
              {plan.meals.map((meal, i) => (
                <motion.div
                  key={meal.meal}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-card p-4"
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-royal">
                      {meal.meal}
                    </div>
                    <div className="mt-1 text-sm text-foreground/85">
                      {meal.food}
                    </div>
                  </div>
                  <div className="shrink-0 font-heading text-lg text-metallic">
                    {meal.calories} kcal
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-royal/20 bg-royal/5 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-royal">
                Notes
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
