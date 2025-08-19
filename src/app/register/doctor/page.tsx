"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import z from "zod";
import { doctorRegisterSchema } from "@/validation/doctorRegisterSchema";
import {
  DoctorRegisterData,
  useRegisterDoctorMutation,
} from "@/services/doctorApi";

type FormValues = z.infer<typeof doctorRegisterSchema>;

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [registerDoctor, { isLoading }] = useRegisterDoctorMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(doctorRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      role: "doctor",
      password: "",
      speciality: "",
      degree: "",
      availabilities: [
        {
          isRecurring: false,
          dayOfWeek: undefined,
          date: undefined,
          startTime: "",
          endTime: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "availabilities",
  });

  const [dob, setDob] = useState<Date | undefined>();
  const onSubmit = async (values: FormValues) => {
    try {
      if (dob) values.dob = dob.toISOString();
      const data: DoctorRegisterData = { ...values, role: "doctor" };
      const response = await registerDoctor(data).unwrap();
      toast.success("Registration successful!");
      router.push("/login");
    } catch (error: any) {
      toast.error("Registration failed!");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-2">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Doctor Registration
        </h2>
        <div className="max-h-[75vh] overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="flex items-center justify-between gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+8801XXXXXXXXX"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => {
                    const currentDate = dob;
                    const handleDateChange = (
                      selectedDate: Date | undefined
                    ) => {
                      setDob(selectedDate);
                      field.onChange(
                        selectedDate ? selectedDate.toISOString() : ""
                      );
                    };
                    return (
                      <FormItem className="flex-1">
                        <FormLabel>
                          Date of Birth{" "}
                          <span className="text-red-600 font-bold -ml-1.5">
                            *
                          </span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !currentDate ? "text-muted-foreground" : ""
                                }`}
                              >
                                {currentDate ? (
                                  format(currentDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={currentDate}
                              onSelect={handleDateChange}
                              disabled={(d) =>
                                d > new Date() || d < new Date("1900-01-01")
                              }
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center justify-between gap-6">
                <FormField
                  control={form.control}
                  name="speciality"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel>Speciality *</FormLabel>
                      <FormControl>
                        <Input placeholder="Cardiology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem className="w-1/2">
                      <FormLabel>Degree *</FormLabel>
                      <FormControl>
                        <Input placeholder="MBBS, MD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Availabilities *</h3>
                {fields.map((fieldItem, index) => (
                  <div
                    key={fieldItem.id}
                    className="border rounded p-4 space-y-4"
                  >
                    <div className="flex gap-x-6">
                      <FormField
                        control={form.control}
                        name={`availabilities.${index}.isRecurring`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Recurring Weekly?</FormLabel>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(val === "true")
                              }
                              value={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch(`availabilities.${index}.isRecurring`) ? (
                        <FormField
                          control={form.control}
                          name={`availabilities.${index}.dayOfWeek`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Day of Week *</FormLabel>
                              <Select
                                onValueChange={(val) =>
                                  field.onChange(Number(val))
                                }
                                value={String(field.value ?? "")}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="0">Sunday</SelectItem>
                                  <SelectItem value="1">Monday</SelectItem>
                                  <SelectItem value="2">Tuesday</SelectItem>
                                  <SelectItem value="3">Wednesday</SelectItem>
                                  <SelectItem value="4">Thursday</SelectItem>
                                  <SelectItem value="5">Friday</SelectItem>
                                  <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name={`availabilities.${index}.date`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Date *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="w-full text-left"
                                    >
                                      {field.value
                                        ? format(new Date(field.value), "PPP")
                                        : "Pick a date"}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={(d) =>
                                      field.onChange(d?.toISOString())
                                    }
                                    disabled={(d) => d < new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <FormField
                        control={form.control}
                        name={`availabilities.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem className="w-1/2">
                            <FormLabel>
                              Start Time (Hour-Minute-PM/AM) *
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`availabilities.${index}.endTime`}
                        render={({ field }) => (
                          <FormItem className="w-1/2">
                            <FormLabel>
                              End Time (Hour-Minute-PM/AM) *
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      Remove Slot
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      isRecurring: false,
                      dayOfWeek: undefined,
                      date: undefined,
                      startTime: "",
                      endTime: "",
                    })
                  }
                >
                  Add Availability
                </Button>
              </div>

              <Button type="submit" className="w-full mt-4">
                Register
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
