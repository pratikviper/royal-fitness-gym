"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { newsletterSchema, type NewsletterValues } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeToNewsletter } from "@/lib/enquiries";

/**
 * Newsletter opt-in. Validated with zod, then persisted to
 * `newsletter_subscribers` (localStorage when Firebase isn't configured).
 */
export function NewsletterForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
  });

  async function onSubmit(values: NewsletterValues) {
    setError(null);
    try {
      await subscribeToNewsletter(values.email);
      setDone(true);
      reset();
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      console.error("Newsletter subscription failed:", err);
      setError("Could not subscribe right now. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="Your email"
          aria-label="Email address"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isSubmitting}
          aria-label="Subscribe"
        >
          {done ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
        </Button>
      </div>
      {errors.email && (
        <p className="text-xs text-destructive">{errors.email.message}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {done && (
        <p className="text-xs text-royal">You&apos;re on the list — welcome!</p>
      )}
    </form>
  );
}
