import type { Trainer } from "@/types";

/**
 * Trainer roster (5 trainers). Images point to /public/trainers/placeholder.svg
 * — drop real photos into /public/trainers and update the `image` paths.
 */
const PLACEHOLDER = "/trainers/placeholder.svg";

export const trainers: Trainer[] = [
  {
    id: "marcus-cole",
    name: "Marcus Cole",
    role: "Head Coach",
    experience: "12+ years",
    specialization: "Strength & Conditioning",
    image: PLACEHOLDER,
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "elena-frost",
    name: "Elena Frost",
    role: "Personal Trainer",
    experience: "9 years",
    specialization: "HIIT & Fat Loss",
    image: PLACEHOLDER,
    socials: { instagram: "#", facebook: "#" },
  },
  {
    id: "andre-silva",
    name: "Andre Silva",
    role: "Personal Trainer",
    experience: "10 years",
    specialization: "Weight Training",
    image: PLACEHOLDER,
    socials: { instagram: "#", twitter: "#" },
  },
  {
    id: "nadia-khan",
    name: "Nadia Khan",
    role: "Personal Trainer",
    experience: "6 years",
    specialization: "Functional & Mobility",
    image: PLACEHOLDER,
    socials: { instagram: "#", linkedin: "#" },
  },
  {
    id: "liam-reyes",
    name: "Liam Reyes",
    role: "Personal Trainer",
    experience: "8 years",
    specialization: "Bodybuilding & Nutrition",
    image: PLACEHOLDER,
    socials: { instagram: "#", twitter: "#", facebook: "#" },
  },
];
