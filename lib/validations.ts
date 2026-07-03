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
