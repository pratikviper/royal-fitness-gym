import type { MembershipPlan } from "@/types";

/** One-time compulsory entry charge (INR), on top of the package price. */
export const ENTRY_CHARGE = 300;

/** Membership policies shown alongside pricing. */
export const membershipPolicies = ["No Refund", "No Transfer", "No Freeze"];

/**
 * Real Royal Fitness packages. Each package has 3 / 6 / 12-month options.
 * Prices are in INR.
 */
export const memberships: MembershipPlan[] = [
  {
    id: "weight-training",
    name: "Weight Training",
    tagline: "Build strength on the floor",
    accent: "hsl(0 0% 80%)",
    durations: [
      { label: "3 Months", months: 3, price: 4500 },
      { label: "6 Months", months: 6, price: 6500 },
      { label: "12 Months", months: 12, price: 9000 },
    ],
    features: [
      "Unisex gym access",
      "Weight training floor",
      "Personalized workout plan",
      "Certified trainers",
      "Locker facility",
      "BMI assessment",
    ],
  },
  {
    id: "weight-cardio",
    name: "Weight Training + Cardio",
    tagline: "Strength meets conditioning",
    accent: "hsl(210 80% 62%)",
    durations: [
      { label: "3 Months", months: 3, price: 5500 },
      { label: "6 Months", months: 6, price: 7500 },
      { label: "12 Months", months: 12, price: 12000 },
    ],
    features: [
      "Everything in Weight Training",
      "Full cardio zone access",
      "Functional training",
      "Group activities",
      "Nutrition guidance",
    ],
  },
  {
    id: "all-in-one",
    name: "All In One",
    tagline: "The complete transformation",
    accent: "hsl(351 83% 52%)",
    featured: true,
    durations: [
      { label: "3 Months", months: 3, price: 6500 },
      { label: "6 Months", months: 6, price: 9000 },
      { label: "12 Months", months: 12, price: 14000 },
    ],
    features: [
      "Everything in + Cardio",
      "1-on-1 personal training",
      "100% result-focused coaching",
      "Diet & nutrition planning",
      "Group activities & functional",
      "Priority support",
    ],
  },
];
