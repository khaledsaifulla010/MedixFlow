"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { patientFormSchema } from "@/validation/patientFormSchema";
import axios from "axios";

type PatientFormValues = z.infer<typeof patientFormSchema>;
type Role = "admin" | "doctor" | "patient";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  dob: string;
}

export default function PatientDetailsForm() {
  const [user, setUser] = useState<User | null>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      password: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      bloodGroup: "Unknown",
      gender: "Unknown",
      medicalHistory: "",
      allergies: "Unknown",
      nationality: "",
      maritalStatus: "Unknown",
      occupation: "",
      height: undefined,
      weight: undefined,
      smokingStatus: "Unknown",
      alcoholConsumption: "Unknown",
      chronicDiseases: "",
      preferredLanguage: "",
    },
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get<User>("/api/auth/me");
        setUser(res.data);
        form.reset({
          ...res.data,
          password: "",
          address: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          bloodGroup: "Unknown",
          gender: "Unknown",
          medicalHistory: "",
          allergies: "Unknown",
          nationality: "",
          maritalStatus: "Unknown",
          occupation: "",
          height: undefined,
          weight: undefined,
          smokingStatus: "Unknown",
          alcoholConsumption: "Unknown",
          chronicDiseases: "",
          preferredLanguage: "",
        });
      } catch {
        // Handle error if needed
      }
    }
    fetchUser();
  }, []);

  if (!user) return <div>Loading...</div>;

  function onSubmit(data: PatientFormValues) {
    console.log("Form data:", data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-3xl mx-auto p-4 border"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email (disabled) */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled className="cursor-not-allowed" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone and DOB */}
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role (disabled) and Occupation */}
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="Occupation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Nationality and Preferred Language */}
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Nationality</FormLabel>
                <FormControl>
                  <Input placeholder="Nationality" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferredLanguage"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Preferred Language</FormLabel>
                <FormControl>
                  <Input placeholder="Preferred Language" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Emergency Contact Name & Phone */}
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="emergencyContactName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Emergency Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="Emergency contact name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergencyContactPhone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Emergency Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+8801XXXXXXXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Blood Group and Allergies */}
        <div className="flex space-x-4 gap-32">
          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Blood Group</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "A_Positive",
                      "A_Negitive",
                      "B_Positive",
                      "B_Negitive",
                      "AB_Positive",
                      "AB_Negitive",
                      "O_Positive",
                      "O_Negitive",
                      "Unknown",
                    ].map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Allergies</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select allergies status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Yes", "No", "Unknown"].map((val) => (
                      <SelectItem key={val} value={val}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Gender and Marital Status */}
        <div className="flex space-x-4 gap-32">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Male", "Female", "Other", "Unknown"].map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maritalStatus"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Marital Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "Single",
                      "Married",
                      "Divorced",
                      "Widowed",
                      "Unknown",
                    ].map((val) => (
                      <SelectItem key={val} value={val}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Smoking Status and Alcohol Consumption */}
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="smokingStatus"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Smoking Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select smoking status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Smoker", "Non_Smoker", "Former_Smoker", "Unknown"].map(
                      (val) => (
                        <SelectItem key={val} value={val}>
                          {val.replace(/_/g, " ")}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alcoholConsumption"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Alcohol Consumption</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alcohol consumption" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["None", "Social", "Regular", "Unknown"].map((val) => (
                      <SelectItem key={val} value={val}>
                        {val}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Height and Weight */}
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Height in cm"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Weight in kg"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Medical History and Chronic Diseases */}
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="medicalHistory"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Medical History</FormLabel>
                <FormControl>
                  <Textarea placeholder="Brief medical history" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chronicDiseases"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Chronic Diseases</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe chronic diseases"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Save Details
        </Button>
      </form>
    </Form>
  );
}
