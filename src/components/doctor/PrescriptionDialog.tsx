"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import {
  PrescriptionFormData,
  prescriptionSchema,
} from "@/validation/prescriptionSchema";
import { useCreatePrescriptionMutation } from "@/services/prescriptionApi";
import { Plus } from "lucide-react";

interface PrescriptionDialogProps {
  appointmentId: string;
  patientName?: string;
}

const PrescriptionDialog: React.FC<PrescriptionDialogProps> = ({
  appointmentId,
  patientName,
}) => {
  const [createPrescription] = useCreatePrescriptionMutation();

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      appointmentId,
      advice: "",
      followUp: "",
      items: [{ name: "", type: "", dosage: "", dosageTime: "", duration: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      await createPrescription(data).unwrap();
      toast.success("Prescription Given Successfully!");
      form.reset({
        appointmentId,
        advice: "",
        followUp: "",
        items: [
          { name: "", type: "", dosage: "", dosageTime: "", duration: "" },
        ],
      });
    } catch (err: any) {
      console.error("Submit error:", err);
      const message =
        err?.data?.error || err?.message || "Failed to save prescription!";
      toast.error(message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="cursor-pointer">
          Give Prescription
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Give Prescription to {patientName}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 border p-2 rounded-md"
        >
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border p-4 rounded-md space-y-4 mb-2"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Medicine {index + 1}</h3>
                {index > 0 && (
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="mb-4">Medicine Name</Label>
                  <Input
                    placeholder="e.g. Napa Extra 20mg"
                    {...form.register(`items.${index}.name`)}
                  />
                </div>
                <div className="flex-1">
                  <Label className="mb-4">Medicine Type</Label>
                  <Input
                    placeholder="e.g. Cap / Tab / Amp."
                    {...form.register(`items.${index}.type`)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="mb-4">Dosage</Label>
                  <Input
                    placeholder="e.g. 1 + 1 + 1"
                    {...form.register(`items.${index}.dosage`)}
                  />
                </div>
                <div className="flex-1">
                  <Label className="mb-4">Dosage Time</Label>
                  <Input
                    placeholder="e.g. Morning, Evening, --"
                    {...form.register(`items.${index}.dosageTime`)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="mb-4">Duration</Label>
                  <Input
                    placeholder="e.g. 10 days"
                    {...form.register(`items.${index}.duration`)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end mb-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() =>
                append({
                  name: "",
                  type: "",
                  dosage: "",
                  dosageTime: "",
                  duration: "",
                })
              }
            >
              <Plus /> Add Medicine
            </Button>
          </div>

          <div>
            <Label className="mb-4">Advice</Label>
            <Textarea
              placeholder="e.g. Give your advice"
              {...form.register("advice")}
            />
          </div>

          <div>
            <Label className="mb-4">Follow Up Time</Label>
            <Input
              placeholder="e.g. 10-Aug-2025"
              {...form.register("followUp")}
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="cursor-pointer">
              Save Prescription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionDialog;
