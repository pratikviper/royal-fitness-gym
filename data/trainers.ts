import type { Trainer } from "@/types";

/**
 * Trainer roster. Images point to /public/trainers/placeholder.svg for now —
 * drop real photos into /public/trainers and update the `image` paths.
 */
const PLACEHOLDER = "/trainers/placeholder.svg";

export const trainers: Trainer[] = [
  {
    id: "marcus-cole",
    name: "Marcus Cole",
    category: "Diamond",
    experience: "12+ years",
    specialization: "Strength & Powerlifting",
    image: PLACEHOLDER,
    socials: { instagram: "#", twitter: "#", linkedin: "#" },
  },
  {
    id: "elena-frost",
    name: "Elena Frost",
    category: "Platinum",
    experience: "9 years",
    specialization: "HIIT & Conditioning",
    image: PLACEHOLDER,
    socials: { instagram: "#", facebook: "#" },
  },
  {
    id: "andre-silva",
    name: "Andre Silva",
    category: "Diamond",
    experience: "14 years",
    specialization: "Olympic Weightlifting",
    image: PLACEHOLDER,
    socials: { instagram: "#", twitter: "#" },
  },
  {
    id: "nadia-khan",
    name: "Nadia Khan",
    category: "Gold",
    experience: "6 years",
    specialization: "Mobility & Yoga",
    image: PLACEHOLDER,
    socials: { instagram: "#", linkedin: "#" },
  },
  {
    id: "liam-reyes",
    name: "Liam Reyes",
    category: "Platinum",
    experience: "10 years",
    specialization: "Boxing & Athletic Prep",
    image: PLACEHOLDER,
    socials: { instagram: "#", twitter: "#", facebook: "#" },
  },
  {
    id: "sofia-martin",
    name: "Sofia Martin",
    category: "Silver",
    experience: "4 years",
    specialization: "Functional Training",
    image: PLACEHOLDER,
    socials: { instagram: "#" },
  },
  {
    id: "dominic-hale",
    name: "Dominic Hale",
    category: "Gold",
    experience: "8 years",
    specialization: "Bodybuilding & Nutrition",
    image: PLACEHOLDER,
    socials: { instagram: "#", linkedin: "#" },
  },
  {
    id: "aisha-bello",
    name: "Aisha Bello",
    category: "Diamond",
    experience: "11 years",
    specialization: "Performance Coaching",
    image: PLACEHOLDER,
    socials: { instagram: "#", twitter: "#" },
  },
];

export const trainerCategories = [
  "All",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
] as const;
