import type { Facility, StatItem } from "@/types";
import {
  Dumbbell,
  HeartPulse,
  Waves,
  Users,
  Flame,
  ShieldCheck,
  BadgeCheck,
  Trophy,
  Target,
} from "lucide-react";

export const facilities: Facility[] = [
  {
    id: "strength",
    title: "Strength Floor",
    description:
      "Competition-grade racks, platforms and free weights across a 6,000 sq ft floor.",
    icon: Dumbbell,
  },
  {
    id: "cardio",
    title: "Cardio Theatre",
    description:
      "Latest smart cardio with immersive screens and heart-rate tracking.",
    icon: HeartPulse,
  },
  {
    id: "recovery",
    title: "Recovery & Spa",
    description:
      "Sauna, steam, ice baths and massage to keep you performing at your peak.",
    icon: Waves,
  },
  {
    id: "classes",
    title: "Studio Classes",
    description:
      "Boutique studios for HIIT, spin, yoga and boxing led by expert coaches.",
    icon: Users,
  },
  {
    id: "hiit",
    title: "Functional Zone",
    description:
      "Sleds, rigs, turf and rope for athletic, functional conditioning.",
    icon: Flame,
  },
  {
    id: "coaching",
    title: "Elite Coaching",
    description:
      "Certified coaches, InBody analysis and data-driven programming.",
    icon: ShieldCheck,
  },
];

export const stats: StatItem[] = [
  { label: "Members", value: 500, suffix: "+", icon: Users },
  { label: "Certified Trainers", value: 25, suffix: "+", icon: BadgeCheck },
  { label: "Years of Experience", value: 10, suffix: "+", icon: Trophy },
  { label: "Transformation Focus", value: 100, suffix: "%", icon: Target },
];
