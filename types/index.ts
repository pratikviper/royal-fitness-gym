import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
}

/** A single duration/price option within a membership package. */
export interface MembershipDuration {
  label: string; // e.g. "3 Months"
  months: number;
  price: number; // INR
}

export interface MembershipPlan {
  id: string;
  name: string; // e.g. "Weight Training"
  tagline: string;
  durations: MembershipDuration[];
  features: string[];
  featured?: boolean;
  accent: string; // hsl string used for the card accent
}

/** Royal Fitness has two trainer categories. */
export type TrainerLevel = "Senior" | "Junior";

export interface Trainer {
  id: string;
  name: string;
  category: TrainerLevel;
  specialization: string;
  image: string;
  /** personal-training rate (INR) */
  ptRate: number;
  socials: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  rating: number;
}

export interface Facility {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  /** column span hint for the masonry grid */
  span?: "wide" | "tall" | "normal";
}

export type GalleryCategory =
  | "Strength"
  | "Cardio"
  | "Classes"
  | "Facilities"
  | "Transformations";

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: LucideIcon;
}
