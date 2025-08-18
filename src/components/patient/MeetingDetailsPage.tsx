"use client";

import React from "react";
import {
  Appointment,
  useGetAppointmentsQuery,
} from "@/services/appointmentApi";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlarmClockCheck,
  CalendarDays,
  FlaskConical,
  GraduationCap,
  Loader2,
  UserStar,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";

const MeetingDetailsPage: React.FC = () => {
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useGetAppointmentsQuery();

  const router = useRouter();
  const handleJoin = (id: string) => {
    router.push(`/dashboard/meeting/${id}`);
  };

  if (isLoading)
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Loading Meetings
        <Loader2 className="animate-spin" />
      </div>
    );
  if (isError)
    return (
      <div className="font-bold text-xl mt-36 text-center">
        Error Fetching Meetings.
      </div>
    );
  if (!appointments.length)
    return (
      <div className="font-bold text-xl mt-36 text-center">
        No Meetings Found.
      </div>
    );

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appt: Appointment) => {
          const start = new Date(appt.startTime);
          const end = new Date(appt.endTime);
          const date = format(start, "dd MMM yyyy");
          const timeRange = `${format(start, "hh:mm a")} - ${format(
            end,
            "hh:mm a"
          )}`;

          return (
            <Card key={appt.id} className="shadow-md dark:bg-gray-900 border-2">
              <CardHeader>
                <CardTitle className="font-black text-xl -mb-6 -mt-2 flex items-center gap-2">
                  <UserStar className="h-6" /> Dr. {appt.doctor.user.name}
                </CardTitle>
              </CardHeader>
              <p className="border-b-2"></p>
              <CardContent>
                <table className="w-full text-sm -mt-3 ">
                  <tbody>
                    <tr className="border-b-2 ">
                      <td className="font-semibold py-2 flex items-center gap-2">
                        <FlaskConical className="h-5" /> Speciality
                      </td>
                      <td className="py-2">{appt.doctor.speciality}</td>
                    </tr>
                    <tr className="border-b-2">
                      <td className="font-semibold py-2 flex items-center gap-2">
                        <GraduationCap className="h-5" /> Degree
                      </td>
                      <td className="py-2">{appt.doctor.degree}</td>
                    </tr>
                    <tr className="border-b-2">
                      <td className="font-semibold py-2 flex items-center gap-2">
                        <CalendarDays className="h-5" /> Appointment Date
                      </td>
                      <td className="py-2">{date}</td>
                    </tr>
                    <tr className="border-b-2">
                      <td className="font-semibold py-2 flex items-center gap-2">
                        <AlarmClockCheck className="h-5" /> Appointment Time
                      </td>
                      <td className="py-2">{timeRange}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
              <p className="border-b-2"></p>
              <div className="flex px-4 -mb-2 -mt-2 justify-end">
                <Button
                  type="button"
                  onClick={() => handleJoin(appt.id)}
                  className="cursor-pointer"
                >
                  <Video className="mt-0.5 mr-2" /> Join Meeting
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
