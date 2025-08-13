"use client";
import React from "react";
import { format } from "date-fns";
import { useGetAvailableDoctorsQuery } from "@/services/appointmentApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  UserCircle,
  Phone,
  Mail,
  Cake,
  FlaskConical,
  GraduationCap,
  ClipboardClock,
} from "lucide-react";
import { Button } from "../ui/button";

const AppointmentPage = () => {
  const { data: doctors, isLoading, isError } = useGetAvailableDoctorsQuery();

  if (isLoading) return <p>Loading doctors...</p>;
  if (isError || !doctors) return <p>Failed to load doctors.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <Card key={doctor.id} className="dark:bg-gray-800 border-2">
          {/* Header */}
          <CardHeader className="flex items-center space-x-4">
            <UserCircle className="w-12 h-14" />
            <div>
              <CardTitle className="text-2xl font-black ml-2">
                Dr. {doctor.name}
              </CardTitle>
              <CardTitle className="text-base font-bold flex items-center">
                <FlaskConical className="h-5" /> Speciality :{" "}
                {doctor.speciality}
              </CardTitle>
              <CardTitle className="text-base font-bold flex items-center">
                <GraduationCap className="h-5" /> Degree : {doctor.degree}
              </CardTitle>
            </div>
          </CardHeader>

          <div className="border-b-2 -mt-2"></div>

          {/* Contact Info */}
          <CardTitle className="text-xl font-bold ml-6 -mt-4">
            Contact Details
          </CardTitle>
          <CardContent className="-mt-4">
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <tbody>
                <tr className="border-b-2 dark:border-gray-700">
                  <td className="py-2 font-semibold flex items-center gap-2">
                    <Phone className="h-5" /> Phone
                  </td>
                  <td className="py-2">{doctor.phone}</td>
                </tr>
                <tr className=" dark:border-gray-700">
                  <td className="py-2 font-semibold flex items-center gap-2">
                    <Mail className="h-5" /> Email
                  </td>
                  <td className="py-2">{doctor.email}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
          <p className="border-b-2 -mt-4"></p>
          {/* Availabilities */}
          <CardTitle className="text-xl font-bold ml-6 -mt-4">
            Availabilities
          </CardTitle>
          <CardContent className="-mt-4">
            {doctor.availabilities.length === 0 ? (
              <p>No availabilities set.</p>
            ) : (
              <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300 border-t-2">
                <thead>
                  <tr className="border-b-2 dark:border-gray-700">
                    <th className="py-2">Type</th>
                    <th className="py-2">Day / Date</th>
                    <th className="py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {doctor.availabilities.map((slot, index) => (
                    <tr key={index} className="border-b-2 dark:border-gray-700">
                      <td className="py-2">
                        {slot.isRecurring ? "Recurring" : "One-Time"}
                      </td>
                      <td className="py-2">
                        {slot.isRecurring
                          ? [
                              "Sunday",
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                            ][slot.dayOfWeek ?? 0]
                          : format(new Date(slot.date!), "dd MMMM yyyy")}
                      </td>
                      <td className="py-2">
                        {slot.startTime} - {slot.endTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
          <div className="flex justify-end px-4">
            {" "}
            <Button className="w-1/3 cursor-pointer font-bold">
              <ClipboardClock /> Get Appoint
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentPage;
