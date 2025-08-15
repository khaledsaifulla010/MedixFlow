"use client";
import {
  useGetAppointmentsQuery,
  Appointment,
} from "@/services/appointmentApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  AlarmClockCheck,
  Video,
} from "lucide-react";
import { format } from "date-fns";

const PatientQueueDetails = () => {
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useGetAppointmentsQuery();

  if (isLoading) return <div>Loading appointments...</div>;
  if (isError) return <div>Error fetching appointments.</div>;
  if (!appointments.length) return <div>No appointments found.</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Patient Queue</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appt: Appointment) => {
          const start = new Date(appt.startTime);
          const end = new Date(appt.endTime);
          const date = format(start, "dd MMM yyyy");
          const timeRange = `${format(start, "hh:mm a")} - ${format(
            end,
            "hh:mm a"
          )}`;

          const patientUser = appt.patient?.user;

          return (
            <Card key={appt.id} className="shadow-md dark:bg-gray-900 border-2">
              <CardHeader>
                <CardTitle className="font-black text-xl -mb-6 -mt-2 flex items-center gap-2">
                  <User className="h-6" />{" "}
                  {patientUser?.name || "Unknown Patient"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm -mt-3">
                  <tbody>
                    <tr className="border-b-2">
                      <td className="font-semibold py-2 flex items-center gap-2">
                        Name
                      </td>
                      <td className="py-2">{patientUser?.name || "N/A"}</td>
                    </tr>
                    <tr className="border-b-2">
                      <td className="font-semibold py-2 flex items-center gap-2">
                        <Mail className="h-5" /> Email
                      </td>
                      <td className="py-2">{patientUser?.email || "N/A"}</td>
                    </tr>
                    <tr className="border-b-2">
                      <td className="font-semibold py-2 flex items-center gap-2">
                        <Phone className="h-5" /> Phone
                      </td>
                      <td className="py-2">{patientUser?.phone || "N/A"}</td>
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
              <div className="flex px-4 -mb-2 -mt-2 justify-end">
                <Button
                  onClick={() =>
                    window.open(`/dashboard/video-call/${appt.id}`, "_blank")
                  }
                  className="cursor-pointer"
                >
                  <Video className="mt-0.5" /> Join Meeting
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PatientQueueDetails;
