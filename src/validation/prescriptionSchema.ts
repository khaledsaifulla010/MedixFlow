import * as z from "zod";

export const prescriptionSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  type: z.string().min(1, "Type is required"),
  dosage: z.string().min(1, "Dosage is required"), 
  dosageTime: z.string().min(1, "Dosage time is required"), 
  duration: z.string().min(1, "Duration is required"),
  advice: z.string().optional(),
  followUp: z.string().optional(),
});

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
