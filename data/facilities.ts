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
  Building2,
  HeartPulse,
  Flower2,
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
    id: "bodybuilding",
    title: "Bodybuilding",
    description:
      "Hypertrophy-focused programming to build serious size and definition.",
    icon: Dumbbell,
  },
  {
    id: "cardio",
    title: "Cardio",
    description:
      "A full cardio zone to boost endurance, stamina, and heart health.",
    icon: HeartPulse,
  },
  {
    id: "zumba",
    title: "Zumba",
    description:
      "High-energy Zumba classes that make cardio genuinely fun.",
    icon: Music2,
  },
  {
    id: "yoga",
    title: "Yoga",
    description:
      "Guided yoga sessions to improve flexibility, balance, and recovery.",
    icon: Flower2,
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
  { label: "Active Members", value: 1000, suffix: "+", icon: Users },
  { label: "Societies Served", value: 20, suffix: "+", icon: Building2 },
  { label: "Years Strong", value: 8, suffix: "+", icon: Trophy },
  { label: "Result Focus", value: 100, suffix: "%", icon: Target },
];
