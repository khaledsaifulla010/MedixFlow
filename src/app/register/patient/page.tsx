"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { registerPatient } from "@/features/auth/authActions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PatientRegisterInput,
  patientRegisterSchema,
} from "@/validation/patientRegisterSchema";

export default function PatientRegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [date, setDate] = useState<Date | undefined>();

  const form = useForm<PatientRegisterInput>({
    resolver: zodResolver(patientRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: undefined,
      password: "",
    },
  });

  const onSubmit = async (values: PatientRegisterInput) => {
    if (date) values.dob = date; // pass Date object directly

    const res = await dispatch(registerPatient(values));
    if (res.success) {
      toast.success("Registration Successful");
      router.push("/login");
    } else {
      toast.error(res.message || "Registration failed!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6 border-2">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Patient Account
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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
            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+8801XXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* DOB */}
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => {
                const handleDateChange = (selectedDate: Date | undefined) => {
                  setDate(selectedDate);
                  field.onChange(selectedDate || new Date());
                };
                return (
                  <FormItem className="flex-1">
                    <FormLabel>
                      Date of Birth{" "}
                      <span className="text-red-600 font-bold -ml-1.5">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !date ? "text-muted-foreground" : ""
                            }`}
                          >
                            {date ? (
                              format(date, "PPP")
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
                          selected={date}
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
            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full cursor-pointer">
              Register
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
