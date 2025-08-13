import { z } from "zod";

export const patientFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  phone: z.string().min(10, "Phone is required"),
  dob: z.string().min(1, "Date of birth is required"),

  role: z
    .enum(["admin", "doctor", "patient"] as const)
    .refine((val) => !!val, { message: "Role is required" }),

  address: z.string().min(1, "Address is required"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z
    .string()
    .min(1, "Emergency contact phone is required"),

  bloodGroup: z
    .enum([
      "A_Positive",
      "A_Negitive",
      "B_Positive",
      "B_Negitive",
      "AB_Positive",
      "AB_Negitive",
      "O_Positive",
      "O_Negitive",
      "Unknown",
    ] as const)
    .refine((val) => !!val, { message: "Blood group is required" }),

  gender: z
    .enum(["Male", "Female", "Other", "Unknown"] as const)
    .refine((val) => !!val, { message: "Gender is required" }),

  medicalHistory: z.string().min(1, "Medical history is required"),

  allergies: z
    .enum(["Yes", "No", "Unknown"] as const)
    .refine((val) => !!val, { message: "Allergies field is required" }),

  nationality: z.string().min(1, "Nationality is required"),

  maritalStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed", "Unknown"] as const)
    .refine((val) => !!val, { message: "Marital status is required" }),

  occupation: z.string().min(1, "Occupation is required"),

  height: z
    .number()
    .refine((val) => val !== undefined, { message: "Height is required" }),

  weight: z
    .number()
    .refine((val) => val !== undefined, { message: "Weight is required" }),

  smokingStatus: z
    .enum(["Smoker", "Non_Smoker", "Former_Smoker", "Unknown"] as const)
    .refine((val) => !!val, { message: "Smoking status is required" }),

  alcoholConsumption: z
    .enum(["None", "Social", "Regular", "Unknown"] as const)
    .refine((val) => !!val, {
      message: "Alcohol consumption status is required",
    }),

  chronicDiseases: z.string().min(1, "Chronic diseases field is required"),

  preferredLanguage: z.string().min(1, "Preferred language is required"),
});
