"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import type { Trainer } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const socialIcons: Record<string, LucideIcon> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
};

/** Reusable trainer card: image, name, role, experience, specialization,
 * socials and a booking CTA. Image reveals + lifts on hover. */
export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={trainer.image}
          alt={trainer.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full bg-royal-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          {trainer.role}
        </span>

        {/* Socials — slide up on hover */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-4 items-center justify-center gap-2 pb-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {Object.entries(trainer.socials).map(([key, href]) => {
            const Icon = socialIcons[key];
            if (!Icon || !href) return null;
            return (
              <a
                key={key}
                href={href}
                aria-label={`${trainer.name} on ${key}`}
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-royal"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-heading text-2xl tracking-wide text-metallic">
            {trainer.name}
          </h3>
          <p className="text-sm text-royal">{trainer.specialization}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{trainer.experience} experience</span>
          <Badge variant="ghost">{trainer.role}</Badge>
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href={`/contact?trainer=${trainer.id}`}>Book Session</a>
        </Button>
      </div>
    </motion.article>
  );
}
