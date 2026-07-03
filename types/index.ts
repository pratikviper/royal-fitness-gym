import type { LucideIcon } from "lucide-react";

/** Shared tier used by membership plans and trainer categories. */
export type Tier = "Silver" | "Gold" | "Platinum" | "Diamond";

export interface NavItem {
  label: string;
  href: string;
}

export interface MembershipPlan {
  id: string;
  tier: Tier;
  price: number;
  period: string;
  tagline: string;
  features: string[];
  featured?: boolean;
  accent: string; // tailwind gradient / hsl string for the tier
}

export interface Trainer {
  id: string;
  name: string;
  category: Tier;
  experience: string;
  specialization: string;
  image: string;
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
