"use client";
import React from "react";
import { useGetDoctorAvailabilitiesQuery } from "@/services/doctorAvailabilitiesApi";
import { format } from "date-fns";
import {
  UserCircle,
  Phone,
  Mail,
  Cake,
  FlaskConical,
  GraduationCap,
  Section,
  CalendarCheck,
  AlarmClock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DoctorProfilePageProps {
  doctorId: string;
}

const DoctorProfileDetails: React.FC<DoctorProfilePageProps> = ({
  doctorId,
}) => {
  const { data, isLoading, isError } =
    useGetDoctorAvailabilitiesQuery(doctorId);

  if (isLoading) return <p className="ml-6">Loading...</p>;
  if (isError || !data?.data.length)
    return <p className="ml-6 text-red-500">Error loading data</p>;
  const doctor = {
    name: data.data[0].doctor.user.name,
    phone: data.data[0].doctor.user.phone,
    email: data.data[0].doctor.user.email,
    dob: data.data[0].doctor.user.dob,
    speciality: data.data[0].doctor.speciality,
    degree: data.data[0].doctor.degree,
    availabilities: data.data.map((a) => ({
      id: a.id,
      isRecurring: a.isRecurring,
      dayOfWeek: a.dayOfWeek,
      date: a.date,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  };

  return (
    <div className="p-6 dark:bg-gray-900 rounded-xl shadow">
      <div className="p-6 space-y-8 border-2 rounded-lg">
        <div className="flex justify-between">
          {/* Personal Info */}
          <Card className="w-[400px] dark:bg-gray-800 border-2">
            <CardHeader className="flex items-center space-x-4">
              <UserCircle className="w-12 h-14" />
              <div>
                <CardTitle className="text-2xl font-black">
                  {doctor.name}
                </CardTitle>
                <CardTitle className="text-base font-medium">
                  Role: Doctor
                </CardTitle>
              </div>
            </CardHeader>
            <div className="border-b-2 -mt-2"></div>
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
                  <tr className="border-b-2 dark:border-gray-700">
                    <td className="py-2 font-semibold flex items-center gap-2">
                      <Mail className="h-5" /> Email
                    </td>
                    <td className="py-2">{doctor.email}</td>
                  </tr>
                  <tr className="border-b-2 dark:border-gray-700">
                    <td className="py-2 font-semibold flex items-center gap-2">
                      <Cake className="h-5" /> Date of Birth
                    </td>
                    <td className="py-2">
                      {format(new Date(doctor.dob), "PPP")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Professional Experience */}
          <Card className="w-[350px] h-[280px] dark:bg-gray-800 border-2 py-12">
            <CardHeader className="flex items-center space-x-4">
              <div>
                <CardTitle className="text-2xl font-black">
                  Professional Experience
                </CardTitle>
              </div>
            </CardHeader>
            <div className="border-b-2 -mt-2"></div>
            <CardTitle className="text-xl font-bold ml-6 -mt-4">
              Details
            </CardTitle>
            <CardContent className="-mt-4">
              <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                <tbody>
                  <tr className="border-b-2 dark:border-gray-700">
                    <td className="py-2 font-semibold flex items-center gap-2">
                      <FlaskConical className="h-5" /> Speciality
                    </td>
                    <td className="py-2">{doctor.speciality}</td>
                  </tr>
                  <tr className="border-b-2 dark:border-gray-700">
                    <td className="py-2 font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5" /> Degree
                    </td>
                    <td className="py-2">{doctor.degree}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="w-[350px] dark:bg-gray-800 border-2 py-12">
            <CardHeader className="flex items-center space-x-4">
              <div>
                <CardTitle className="text-2xl font-black">
                  Availability
                </CardTitle>
              </div>
            </CardHeader>
            <div className="border-b-2 -mt-2"></div>
            <CardTitle className="text-xl font-bold ml-6 -mt-4">
              Details
            </CardTitle>
            <CardContent className="-mt-4">
              {doctor.availabilities.length === 0 ? (
                <p className="ml-2">No availabilities set.</p>
              ) : (
                <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                  <tbody>
                    {doctor.availabilities.map((slot) => (
                      <React.Fragment key={slot.id}>
                        <tr className="border-b-2 dark:border-gray-700">
                          <td className="py-2 font-semibold flex items-center gap-2">
                            <Section className="h-5" /> Type
                          </td>
                          <td className="py-2">
                            {slot.isRecurring ? "Recurring" : "One-time"}
                          </td>
                        </tr>
                        <tr className="border-b-2 dark:border-gray-700">
                          <td className="py-2 font-semibold flex items-center gap-2">
                            <CalendarCheck className="h-5" /> Day / Date
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
                              : slot.date
                              ? new Date(slot.date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}
                          </td>
                        </tr>
                        <tr className="border-b-2 dark:border-gray-700">
                          <td className="py-2 font-semibold flex items-center gap-2">
                            <AlarmClock className="h-5" /> Time
                          </td>
                          <td className="py-2">
                            {slot.startTime} - {slot.endTime}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileDetails;
