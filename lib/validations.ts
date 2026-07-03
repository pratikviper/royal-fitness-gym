import { z } from "zod";

/** Contact form schema — shared by the RHF resolver and any server action. */
export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z
    .string()
    .min(7, "Enter a valid phone number.")
    .regex(/^[+\d\s()-]+$/, "Enter a valid phone number."),
  interest: z.enum(["Membership", "Personal Training", "Group Classes", "Other"], {
    errorMap: () => ({ message: "Select an area of interest." }),
  }),
  message: z.string().min(10, "Tell us a bit more (10+ characters)."),
});

export type ContactValues = z.infer<typeof contactSchema>;

/** BMI calculator schema. Uses metric units (cm / kg). */
export const bmiSchema = z.object({
  height: z.coerce
    .number({ invalid_type_error: "Enter your height." })
    .min(80, "Height seems too low.")
    .max(260, "Height seems too high."),
  weight: z.coerce
    .number({ invalid_type_error: "Enter your weight." })
    .min(25, "Weight seems too low.")
    .max(400, "Weight seems too high."),
  age: z.coerce
    .number({ invalid_type_error: "Enter your age." })
    .min(12, "Must be 12 or older.")
    .max(100, "Enter a valid age."),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Select a gender." }),
  }),
});

export type BmiValues = z.infer<typeof bmiSchema>;

/** Newsletter footer schema. */
export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export type NewsletterValues = z.infer<typeof newsletterSchema>;

/** Workout plan generator schema. */
export const workoutSchema = z.object({
  goal: z.enum(["muscle", "fatloss", "strength", "fitness"], {
    errorMap: () => ({ message: "Pick a goal." }),
  }),
  level: z.enum(["beginner", "intermediate", "advanced"], {
    errorMap: () => ({ message: "Pick your level." }),
  }),
  daysPerWeek: z.coerce
    .number()
    .int()
    .min(3, "Choose 3–6 days.")
    .max(6, "Choose 3–6 days."),
});

export type WorkoutValues = z.infer<typeof workoutSchema>;

/** Diet plan generator schema (metric units). */
export const dietSchema = z.object({
  age: z.coerce.number().min(12, "Must be 12 or older.").max(100, "Enter a valid age."),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Select a gender." }),
  }),
  height: z.coerce.number().min(80, "Height seems too low.").max(260, "Height seems too high."),
  weight: z.coerce.number().min(25, "Weight seems too low.").max(400, "Weight seems too high."),
  activity: z.enum(["sedentary", "light", "moderate", "active", "athlete"], {
    errorMap: () => ({ message: "Select an activity level." }),
  }),
  goal: z.enum(["fatloss", "maintain", "muscle"], {
    errorMap: () => ({ message: "Select a goal." }),
  }),
  diet: z.enum(["veg", "nonveg"], {
    errorMap: () => ({ message: "Select veg or non-veg." }),
  }),
});

export type DietValues = z.infer<typeof dietSchema>;
