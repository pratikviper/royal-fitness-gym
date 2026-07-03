import type { Facility, StatItem } from "@/types";
import {
  Dumbbell,
  UserRound,
  BadgeCheck,
  ClipboardList,
  Salad,
  Lock,
  Music2,
  Flame,
  TrendingDown,
  Users,
  Trophy,
  Target,
} from "lucide-react";

export const facilities: Facility[] = [
  {
    id: "unisex-gym",
    title: "Unisex Gym",
    description:
      "A fully-equipped unisex training floor with modern strength and cardio equipment.",
    icon: Dumbbell,
  },
  {
    id: "personal-training",
    title: "Personal Training",
    description:
      "One-on-one coaching tailored to your body, schedule, and goals.",
    icon: UserRound,
  },
  {
    id: "certified-trainers",
    title: "Certified Trainers",
    description:
      "Train under experienced, certified fitness professionals who get results.",
    icon: BadgeCheck,
  },
  {
    id: "workout-plan",
    title: "Custom Workout Plans",
    description:
      "Structured programs built around your fitness level and targets.",
    icon: ClipboardList,
  },
  {
    id: "nutrition-diet",
    title: "Nutrition & Diet",
    description:
      "Personalized diet and nutrition guidance to fuel your transformation.",
    icon: Salad,
  },
  {
    id: "locker",
    title: "Locker Rooms",
    description:
      "Clean, secure lockers and changing facilities for a hassle-free session.",
    icon: Lock,
  },
  {
    id: "zumba",
    title: "Zumba",
    description:
      "High-energy Zumba classes that make cardio genuinely fun.",
    icon: Music2,
  },
  {
    id: "crossfit-abs",
    title: "CrossFit & Abs",
    description:
      "Functional CrossFit and core-focused training to build real strength.",
    icon: Flame,
  },
  {
    id: "fat-loss",
    title: "Fat Loss Programs",
    description:
      "Targeted fat-loss programs designed to reshape your physique.",
    icon: TrendingDown,
  },
];

export const stats: StatItem[] = [
  { label: "Members", value: 500, suffix: "+", icon: Users },
  { label: "Certified Trainers", value: 25, suffix: "+", icon: BadgeCheck },
  { label: "Years of Experience", value: 10, suffix: "+", icon: Trophy },
  { label: "Transformation Focus", value: 100, suffix: "%", icon: Target },
];
