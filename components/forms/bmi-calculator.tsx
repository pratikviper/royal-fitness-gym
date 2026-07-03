"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { bmiSchema, type BmiValues } from "@/lib/validations";
import { calculateBmi, type BmiResult } from "@/lib/bmi";
import { BmiGauge } from "@/components/forms/bmi-gauge";
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
import { cn } from "@/lib/utils";

/** BMI calculator: zod-validated inputs → animated gauge + tailored advice. */
export function BmiCalculator() {
  const [result, setResult] = useState<BmiResult | null>(null);

  const form = useForm<BmiValues>({
    resolver: zodResolver(bmiSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
      age: undefined,
      gender: undefined,
    },
  });

  function onSubmit(values: BmiValues) {
    setResult(calculateBmi(values.height, values.weight));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Inputs */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="glass rounded-2xl p-6 md:p-8"
          noValidate
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="175"
                      {...field}
                      value={field.value ?? ""}
                    />
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
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="72"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="28"
                      {...field}
                      value={field.value ?? ""}
                    />
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
          </div>

          <Button type="submit" className="mt-7 w-full" size="lg">
            Calculate BMI
          </Button>
        </form>
      </Form>

      {/* Result */}
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-white/10 bg-card p-8">
        <BmiGauge
          position={result?.position ?? 0.5}
          color={result?.color ?? "hsl(0 0% 45%)"}
          value={result?.bmi ?? null}
          category={result?.category ?? null}
        />

        {result ? (
          <motion.p
            key={result.category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm text-center text-sm text-muted-foreground"
          >
            {result.advice}
          </motion.p>
        ) : (
          <p className={cn("max-w-sm text-center text-sm text-muted-foreground")}>
            Enter your details to see your Body Mass Index and a personalized
            recommendation.
          </p>
        )}
      </div>
    </div>
  );
}
