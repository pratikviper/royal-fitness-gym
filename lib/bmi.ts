/** Pure BMI helpers — kept framework-free so they're easy to unit test. */

export interface BmiResult {
  bmi: number;
  category: "Underweight" | "Normal" | "Overweight" | "Obese";
  /** 0–1 position on the gauge (18.5→30 mapped for visual arc) */
  position: number;
  color: string; // hsl string for the gauge needle/label
  advice: string;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** height in cm, weight in kg. */
export function calculateBmi(heightCm: number, weightKg: number): BmiResult {
  const meters = heightCm / 100;
  const bmi = weightKg / (meters * meters);
  const rounded = Math.round(bmi * 10) / 10;

  // Map BMI 12–40 onto the 0–1 gauge for the animated arc.
  const position = clamp01((bmi - 12) / (40 - 12));

  if (bmi < 18.5) {
    return {
      bmi: rounded,
      category: "Underweight",
      position,
      color: "hsl(200 90% 55%)",
      advice: "Focus on calorie-dense nutrition and progressive strength work.",
    };
  }
  if (bmi < 25) {
    return {
      bmi: rounded,
      category: "Normal",
      position,
      color: "hsl(142 70% 45%)",
      advice: "Great range — maintain with balanced training and recovery.",
    };
  }
  if (bmi < 30) {
    return {
      bmi: rounded,
      category: "Overweight",
      position,
      color: "hsl(38 92% 52%)",
      advice: "Blend strength and conditioning; a coach can accelerate results.",
    };
  }
  return {
    bmi: rounded,
    category: "Obese",
    position,
    color: "hsl(351 83% 52%)",
    advice: "A structured, supervised program will build momentum safely.",
  };
}
