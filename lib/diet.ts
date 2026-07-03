/** Pure diet-plan generation — BMR/TDEE (Mifflin-St Jeor), macros + meals. */

export type Gender = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "athlete";
export type DietGoal = "fatloss" | "maintain" | "muscle";
export type DietType = "veg" | "nonveg";

export interface Nutrition {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface Meal {
  meal: string;
  calories: number;
  food: string;
}

export interface DietPlan {
  nutrition: Nutrition;
  meals: Meal[];
  tips: string[];
}

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const GOAL_ADJUST: Record<DietGoal, number> = {
  fatloss: 0.8, // 20% deficit
  maintain: 1.0,
  muscle: 1.12, // ~12% surplus
};

const round = (n: number) => Math.round(n);

/** Mifflin-St Jeor BMR → TDEE → goal-adjusted calories and macros. */
export function computeNutrition({
  age,
  gender,
  height,
  weight,
  activity,
  goal,
}: {
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  activity: ActivityLevel;
  goal: DietGoal;
}): Nutrition {
  const base = 10 * weight + 6.25 * height - 5 * age;
  const bmr = gender === "male" ? base + 5 : base - 161;
  const tdee = bmr * ACTIVITY_FACTOR[activity];
  const calories = tdee * GOAL_ADJUST[goal];

  // Protein: higher for fat loss / muscle gain to preserve/build lean mass.
  const proteinPerKg = goal === "maintain" ? 1.6 : 2;
  const protein = proteinPerKg * weight;
  const fat = (calories * 0.25) / 9; // 25% of calories from fat
  const carbs = (calories - protein * 4 - fat * 9) / 4;

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    calories: round(calories),
    protein: round(protein),
    carbs: round(Math.max(carbs, 0)),
    fat: round(fat),
  };
}

// Indian-friendly meal options by diet type + meal.
const MEALS: Record<DietType, Record<string, string[]>> = {
  veg: {
    Breakfast: [
      "Oats with milk, banana & peanut butter",
      "Paneer bhurji with 2 multigrain rotis",
      "Poha with peanuts + a glass of milk",
      "Besan chilla (2) with mint chutney + curd",
    ],
    Lunch: [
      "2 rotis, dal, mixed-veg sabzi, curd & salad",
      "Rajma with brown rice + salad",
      "Paneer curry with 2 rotis + salad",
      "Chole with jeera rice + curd",
    ],
    Snack: [
      "Greek yogurt with mixed nuts",
      "Roasted chana + a fruit",
      "Protein shake + banana",
      "Sprouts chaat",
    ],
    Dinner: [
      "Tofu/paneer stir-fry with veggies + 2 rotis",
      "Moong dal khichdi with curd",
      "Grilled paneer salad + vegetable soup",
      "Vegetable pulao (brown rice) + raita",
    ],
  },
  nonveg: {
    Breakfast: [
      "3 egg whites + 2 whole eggs + oats",
      "Egg bhurji with 2 rotis",
      "Chicken sausage with brown bread + a fruit",
      "Omelette (3 eggs) + a slice of brown bread",
    ],
    Lunch: [
      "Grilled chicken breast, brown rice & salad",
      "2 rotis, chicken curry, salad & curd",
      "Fish curry with rice + sauteed veggies",
      "Chicken & veg brown-rice bowl",
    ],
    Snack: [
      "2 boiled eggs + a fruit",
      "Greek yogurt + nuts",
      "Whey protein shake",
      "Grilled chicken strips",
    ],
    Dinner: [
      "Grilled chicken/fish with sauteed veggies",
      "Egg curry with 2 rotis + salad",
      "Chicken soup + green salad",
      "Baked fish with stir-fried vegetables",
    ],
  },
};

// Portion of daily calories per meal.
const SPLIT: { meal: string; ratio: number }[] = [
  { meal: "Breakfast", ratio: 0.25 },
  { meal: "Lunch", ratio: 0.3 },
  { meal: "Snack", ratio: 0.15 },
  { meal: "Dinner", ratio: 0.3 },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function generateDietPlan(inputs: {
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  activity: ActivityLevel;
  goal: DietGoal;
  diet: DietType;
}): DietPlan {
  const nutrition = computeNutrition(inputs);

  const meals: Meal[] = SPLIT.map(({ meal, ratio }) => ({
    meal,
    calories: round(nutrition.calories * ratio),
    food: pick(MEALS[inputs.diet][meal]),
  }));

  const tips = [
    `Aim for ~${nutrition.protein}g protein daily — spread it across meals.`,
    "Drink 3–4 litres of water and prioritise 7–8 hours of sleep.",
    inputs.goal === "fatloss"
      ? "Stay in a calorie deficit and keep protein high to protect muscle."
      : inputs.goal === "muscle"
        ? "Eat in a slight surplus and train with progressive overload."
        : "Keep intake around maintenance and stay consistent.",
  ];

  return { nutrition, meals, tips };
}
