import { z } from "zod";

export const prescriptionItemSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  type: z.string().min(1, "Type is required"),
  dosage: z.string().min(1, "Dosage is required"),
  dosageTime: z.string().min(1, "Dosage time is required"),
  duration: z.string().min(1, "Duration is required"),
});

export const prescriptionSchema = z.object({
  appointmentId: z.string().min(1, "AppointmentId is required"),
  advice: z.string().optional(),
  followUp: z.string().optional(),
  items: z
    .array(prescriptionItemSchema)
    .min(1, "At least one medicine is required"),
});

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
