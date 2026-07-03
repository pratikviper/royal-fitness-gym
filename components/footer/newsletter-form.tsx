"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { newsletterSchema, type NewsletterValues } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Newsletter opt-in. Client-side validated with zod; swap the onSubmit body
 * for a real API/route handler when the mailing provider is wired up.
 */
export function NewsletterForm() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
  });

  async function onSubmit(_values: NewsletterValues) {
    // TODO: POST to /api/newsletter or your provider (Mailchimp, Resend, ...)
    await new Promise((r) => setTimeout(r, 600));
    setDone(true);
    reset();
    setTimeout(() => setDone(false), 4000);
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
      {done && (
        <p className="text-xs text-royal">You&apos;re on the list — welcome!</p>
      )}
    </form>
  );
}
