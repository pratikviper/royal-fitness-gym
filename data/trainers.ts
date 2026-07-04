import type { Trainer } from "@/types";

/**
 * Trainer roster. Royal Fitness has two categories — Senior and Junior.
 * Senior trainers are the two real coaches; junior entries are placeholders —
 * drop real names + photos into /public/trainers and update below.
 */
const Hrushabh = "/trainers/HRUSHABHCHAUBE.png";
const Prashan = "/trainers/PRASHANGAURAV.png";
const Junior1 = "/trainers/Junior1.png";
const Junior2 = "/trainers/Junior2.png";
const PLACEHOLDER = "/trainers/placeholder.svg";

/** Personal-training rates (INR) by category. */
export const PT_RATES = { Senior: 8000, Junior: 6000 } as const;

export const trainers: Trainer[] = [
  {
    id: "hrushabh-chaube",
    name: "Hrushabh Chaube",
    category: "Senior",
    specialization: "Strength & Bodybuilding",
    image: Hrushabh,
    ptRate: PT_RATES.Senior,
    socials: { instagram: "#", linkedin: "#" },
  },
  {
    id: "prashan-gaurav",
    name: "Prashan Gaurav",
    category: "Senior",
    specialization: "Program Design & Personal Training",
    image: Prashan,
    ptRate: PT_RATES.Senior,
    socials: { instagram: "#", twitter: "#" },
  },
  // ── Junior trainers — placeholders, replace with real names/photos ──
  {
    id: "junior-1",
    name: "Junior Coach",
    category: "Junior",
    specialization: "Fat Loss & Conditioning",
    image: Junior1,
    ptRate: PT_RATES.Junior,
    socials: { instagram: "#" },
  },
  {
    id: "junior-2",
    name: "Junior Coach",
    category: "Junior",
    specialization: "Functional Training",
    image: Junior2,
    ptRate: PT_RATES.Junior,
    socials: { instagram: "#" },
  },
  {
    id: "junior-3",
    name: "Junior Coach",
    category: "Junior",
    specialization: "Cardio & CrossFit",
    image: PLACEHOLDER,
    ptRate: PT_RATES.Junior,
    socials: { instagram: "#" },
  },
];

export const trainerCategories = ["All", "Senior", "Junior"] as const;
