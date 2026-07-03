/** Pure workout-plan generation — framework-free and easy to test. */

export type WorkoutGoal = "muscle" | "fatloss" | "strength" | "fitness";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  goal: WorkoutGoal;
  level: ExperienceLevel;
  daysPerWeek: number;
  split: string;
  days: WorkoutDay[];
  tips: string[];
}

type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "core";

const EXERCISES: Record<MuscleGroup, string[]> = {
  chest: [
    "Barbell Bench Press",
    "Incline Dumbbell Press",
    "Machine Chest Press",
    "Cable Crossover",
    "Chest Fly",
    "Push-ups",
  ],
  back: [
    "Deadlift",
    "Lat Pulldown",
    "Barbell Row",
    "Seated Cable Row",
    "Pull-ups",
    "Single-arm Dumbbell Row",
  ],
  legs: [
    "Barbell Squat",
    "Leg Press",
    "Romanian Deadlift",
    "Walking Lunges",
    "Leg Curl",
    "Leg Extension",
    "Calf Raise",
  ],
  shoulders: [
    "Overhead Press",
    "Lateral Raise",
    "Rear Delt Fly",
    "Arnold Press",
    "Face Pull",
  ],
  biceps: [
    "Barbell Curl",
    "Dumbbell Curl",
    "Hammer Curl",
    "Preacher Curl",
    "Cable Curl",
  ],
  triceps: [
    "Tricep Pushdown",
    "Skull Crushers",
    "Overhead Extension",
    "Dips",
    "Close-grip Bench Press",
  ],
  core: [
    "Plank",
    "Hanging Leg Raise",
    "Cable Crunch",
    "Russian Twist",
    "Ab Rollout",
  ],
};

interface DayTemplate {
  focus: string;
  groups: MuscleGroup[];
}

const SPLITS: Record<number, DayTemplate[]> = {
  3: [
    { focus: "Push", groups: ["chest", "shoulders", "triceps"] },
    { focus: "Pull", groups: ["back", "biceps"] },
    { focus: "Legs & Core", groups: ["legs", "core"] },
  ],
  4: [
    { focus: "Upper A", groups: ["chest", "back", "shoulders"] },
    { focus: "Lower A", groups: ["legs", "core"] },
    { focus: "Upper B", groups: ["back", "chest", "biceps", "triceps"] },
    { focus: "Lower B", groups: ["legs", "core"] },
  ],
  5: [
    { focus: "Push", groups: ["chest", "shoulders", "triceps"] },
    { focus: "Pull", groups: ["back", "biceps"] },
    { focus: "Legs", groups: ["legs", "core"] },
    { focus: "Upper", groups: ["chest", "back", "shoulders"] },
    { focus: "Lower", groups: ["legs", "core"] },
  ],
  6: [
    { focus: "Push A", groups: ["chest", "shoulders", "triceps"] },
    { focus: "Pull A", groups: ["back", "biceps"] },
    { focus: "Legs A", groups: ["legs", "core"] },
    { focus: "Push B", groups: ["chest", "shoulders", "triceps"] },
    { focus: "Pull B", groups: ["back", "biceps"] },
    { focus: "Legs B", groups: ["legs", "core"] },
  ],
};

const SPLIT_NAMES: Record<number, string> = {
  3: "Push / Pull / Legs",
  4: "Upper / Lower",
  5: "PPL + Upper / Lower",
  6: "Push / Pull / Legs ×2",
};

const REP_SCHEMES: Record<WorkoutGoal, { sets: number; reps: string }> = {
  strength: { sets: 5, reps: "3–5" },
  muscle: { sets: 4, reps: "8–12" },
  fatloss: { sets: 3, reps: "12–15" },
  fitness: { sets: 3, reps: "10–12" },
};

const EX_PER_DAY: Record<ExperienceLevel, number> = {
  beginner: 4,
  intermediate: 5,
  advanced: 6,
};

const TIPS: Record<WorkoutGoal, string[]> = {
  strength: [
    "Rest 2–3 minutes between heavy sets.",
    "Prioritize progressive overload — add weight when you hit the top reps.",
    "Warm up thoroughly before your top sets.",
  ],
  muscle: [
    "Rest 60–90 seconds between sets.",
    "Focus on controlled tempo and a full range of motion.",
    "Eat in a slight calorie surplus with enough protein.",
  ],
  fatloss: [
    "Keep rest short (30–45s) to keep the heart rate up.",
    "Add 15–20 minutes of cardio after training.",
    "Pair this with a calorie deficit for best results.",
  ],
  fitness: [
    "Rest around 60 seconds between sets.",
    "Stay consistent — 3–4 sessions a week compounds fast.",
    "Mix in mobility work on rest days.",
  ],
};

/** Fisher–Yates shuffle (returns a new array). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickExercises(
  groups: MuscleGroup[],
  count: number,
  scheme: { sets: number; reps: string },
): Exercise[] {
  const pools = groups.map((g) => shuffle(EXERCISES[g]));
  const chosen: Exercise[] = [];
  let i = 0;
  const guard = count * groups.length + 20;
  while (chosen.length < count && i < guard) {
    const pool = pools[i % groups.length];
    const name = pool.shift();
    if (name) chosen.push({ name, sets: scheme.sets, reps: scheme.reps });
    i++;
  }
  return chosen;
}

export function generateWorkoutPlan({
  goal,
  level,
  daysPerWeek,
}: {
  goal: WorkoutGoal;
  level: ExperienceLevel;
  daysPerWeek: number;
}): WorkoutPlan {
  const template = SPLITS[daysPerWeek] ?? SPLITS[3];
  const scheme = REP_SCHEMES[goal];
  const count = EX_PER_DAY[level];

  const days: WorkoutDay[] = template.map((t, idx) => {
    const exercises = pickExercises(t.groups, count, scheme);
    if (goal === "fatloss") {
      exercises.push({
        name: "Cardio finisher (HIIT or incline walk)",
        sets: 1,
        reps: "15–20 min",
      });
    }
    return { day: `Day ${idx + 1}`, focus: t.focus, exercises };
  });

  return {
    goal,
    level,
    daysPerWeek,
    split: SPLIT_NAMES[daysPerWeek] ?? "Custom",
    days,
    tips: TIPS[goal],
  };
}
