import { z } from "zod";

export const patientFormSchema = z.object({
  // User fields
  name: z.string().min(2, "Name is required"),
  email: z.string().email().nonempty(),
  phone: z.string().min(10, "Phone is required"),
  dob: z.string().nonempty(), // store as ISO date string here
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "doctor", "patient"]),

  // Patient fields (rest as before)
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodGroup: z.enum([
    "A_Positive",
    "A_Negitive",
    "B_Positive",
    "B_Negitive",
    "AB_Positive",
    "AB_Negitive",
    "O_Positive",
    "O_Negitive",
    "Unknown",
  ]),
  gender: z.enum(["Male", "Female", "Other", "Unknown"]),
  medicalHistory: z.string().optional(),
  allergies: z.enum(["Yes", "No", "Unknown"]),
  nationality: z.string().optional(),
  maritalStatus: z.enum([
    "Single",
    "Married",
    "Divorced",
    "Widowed",
    "Unknown",
  ]),
  occupation: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  smokingStatus: z.enum(["Smoker", "Non_Smoker", "Former_Smoker", "Unknown"]),
  alcoholConsumption: z.enum(["None", "Social", "Regular", "Unknown"]),
  chronicDiseases: z.string().optional(),
  preferredLanguage: z.string().optional(),
});
