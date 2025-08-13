"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useGetUserDetails } from "@/hooks/useGetUserDetails";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const schema = z.object({
  allergies: z.string().nonempty("Allergies field is required"),
  pastTreatments: z.string().nonempty("Past treatments field is required"),
  files: z.any().optional(),
});
interface MedicalHistoryFormProps {
  onClose?: () => void;
}

export default function MedicalHistoryForm({
  onClose,
}: MedicalHistoryFormProps) {
  const { user } = useGetUserDetails();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      allergies: "",
      pastTreatments: "",
      files: null,
    },
  });

  const onSubmit = async (values: any) => {
    if (!user) {
      toast.error("User not found. Please log in.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("allergies", values.allergies || "");
      formData.append("pastTreatments", values.pastTreatments || "");

      if (values.files && values.files.length > 0) {
        for (const file of values.files) {
          formData.append("files", file);
        }
      }

      const res = await fetch("/api/patient/medical-history", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save medical history.");
      }

      toast.success("Medical History saved successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-xl mx-auto  border-2 rounded-md">
      <h1 className="text-2xl font-bold  text-center p-4">
        Medical History Details
      </h1>
      <p className="border-b-2 mb-6 mt-2 "></p>
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., peanuts, dust" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pastTreatments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Past Treatments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any past treatments..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Files</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Save Medical History</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
