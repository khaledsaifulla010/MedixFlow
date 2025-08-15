
import { z } from "zod";

export const patientRegisterSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  dob: z.date("Date of birth is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>;
