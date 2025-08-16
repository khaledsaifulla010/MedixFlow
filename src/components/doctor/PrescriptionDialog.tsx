"use client";

import React from "react";
import { useForm } from "react-hook-form";
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

interface PrescriptionDialogProps {
  appointmentId: string;
  patientName?: string;
}

const PrescriptionDialog: React.FC<PrescriptionDialogProps> = ({
  appointmentId,
  patientName,
}) => {
  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      name: "",
      type: "",
      dosage: "",
      dosageTime: "",
      duration: "",
      advice: "",
      followUp: "",
    },
  });

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      console.log("Prescription Submitted:", { ...data, appointmentId });
      toast.success("Prescription saved successfully!");
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save prescription!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="cursor-pointer">
          Give Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="mb-4 text-xl">
            Give Prescription to {patientName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Row 1: Name + Type */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="mb-2">Medicine Name</Label>
              <Input
                placeholder="e.g. Napa Extra 20mg"
                {...form.register("name")}
              />
            </div>
            <div className="flex-1">
              <Label className="mb-2">Medicine Type</Label>
              <Input
                placeholder=" e.g. Cap / Tab / Amp."
                {...form.register("type")}
              />
            </div>
          </div>

          {/* Row 2: Dosage + Dosage Time */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="mb-2">Dosage</Label>
              <Input
                {...form.register("dosage")}
                placeholder="e.g. 1 + 1 + 1"
              />
            </div>
            <div className="flex-1">
              <Label className="mb-2">Dosage Time</Label>
              <Input
                {...form.register("dosageTime")}
                placeholder="e.g. Morning, Evening, -"
              />
            </div>
          </div>

          {/* Row 3: Duration + Follow Up */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="mb-2">Duration</Label>
              <Input {...form.register("duration")} placeholder="e.g. 5 days" />
            </div>
            <div className="flex-1">
              <Label className="mb-2">Follow Up</Label>
              <Input
                {...form.register("followUp")}
                placeholder="e.g. 8/12/2025, 11:00:00 AM"
              />
            </div>
          </div>

          {/* Row 4: Advice */}
          <div>
            <Label className="mb-2">Advice</Label>
            <Textarea
              placeholder="e.g. give any advice"
              {...form.register("advice")}
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
