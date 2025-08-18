"use client";
import React from "react";
import { useGetAppointmentsQuery } from "@/services/appointmentApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Video } from "lucide-react";
import PrescriptionDialog from "./PrescriptionDialog";
import { useRouter } from "next/navigation";

const PatientQueueDetails = () => {
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
        Loading Patient Queue
        <Loader2 className="animate-spin" />
      </div>
    );
  if (isError)
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Error Fetching Patient Queue.
      </div>
    );
  if (!appointments.length)
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        No Patient Queue Found.
      </div>
    );

  return (
    <div>

      <div className="border-2 p-4 rounded-md w-full">
        <Table className="border-2">
          <TableHeader>
            <TableRow>
              <TableHead>SL</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Appointment Date</TableHead>
              <TableHead>Appointment Time</TableHead>
              <TableHead>Join Meeting</TableHead>
              <TableHead>Give Prescription</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment, index) => (
              <TableRow key={appointment.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{appointment.patient?.user.name || "N/A"}</TableCell>
                <TableCell>
                  {appointment.patient?.user.email || "N/A"}
                </TableCell>
                <TableCell>
                  {appointment.patient?.user.phone || "N/A"}
                </TableCell>
                <TableCell>
                  {appointment.startTime
                    ? new Date(appointment.startTime).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {appointment.startTime && appointment.endTime
                    ? `${new Date(appointment.startTime).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )} - ${new Date(appointment.endTime).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    onClick={() => handleJoin(appointment.id)}
                    className="cursor-pointer"
                  >
                    <Video className="mt-0.5 mr-2" /> Join Meeting
                  </Button>
                </TableCell>
                <TableCell>
                  {/* Use the PrescriptionDialog here */}
                  <PrescriptionDialog
                    patientName={appointment.patient?.user.name}
                    appointmentId={appointment.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PatientQueueDetails;
