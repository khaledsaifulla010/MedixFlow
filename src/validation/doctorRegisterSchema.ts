import { z } from "zod";
export const doctorRegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z.string().email("Invalid email address"),
  role: z.literal("doctor"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),

  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date of birth",
  }),

  password: z.string().min(6, "Password must be at least 6 characters"),

  speciality: z
    .string()
    .min(2, "Speciality must be at least 2 characters")
    .max(100, "Speciality cannot exceed 100 characters"),

  degree: z
    .string()
    .min(2, "Degree must be at least 2 characters")
    .max(100, "Degree cannot exceed 100 characters"),

  availabilities: z
    .array(
      z.object({
        isRecurring: z.boolean(),
        dayOfWeek: z.number().int().min(0).max(6).optional(),
        date: z
          .string()
          .optional()
          .refine((val) => !val || !isNaN(Date.parse(val)), {
            message: "Invalid date",
          }),
        startTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
          message: "Invalid start time",
        }),
        endTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
          message: "Invalid end time",
        }),
      })
    )
    .min(1, "At least one availability must be provided"),
});
