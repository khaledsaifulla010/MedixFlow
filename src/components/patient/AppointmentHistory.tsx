"use client";

import { useMemo } from "react";
import {
  useGetAppointmentsQuery,
  Appointment,
  MedicalHistory,
} from "@/services/appointmentApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}
function formatTimeRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  return `${s.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${e.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function AppointmentHistory() {
  const { data = [], isLoading, isFetching, error } = useGetAppointmentsQuery();

  const { totalAppointments, totalHistories, rows } = useMemo(() => {
    const appointments = data as Appointment[];
    const totalAppointments = appointments.length;
    let totalHistories = 0;
    const firstWithPatient = appointments.find((a) => a.patient?.histories);
    const histories = (firstWithPatient?.patient?.histories ||
      []) as MedicalHistory[];
    totalHistories = histories.length;

    const rows = appointments.map((ap) => ({
      id: ap.id,
      doctorName: ap.doctor?.user?.name ?? "-",
      doctorPhone: ap.doctor?.user?.phone ?? "-",
      doctorEmail: ap.doctor?.user?.email ?? "-",
      speciality: ap.doctor?.speciality ?? "-",
      degree: ap.doctor?.degree ?? "-",
      date: formatDate(ap.startTime),
      time: formatTimeRange(ap.startTime, ap.endTime),
      createdAt: ap.startTime,
    }));

    rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { totalAppointments, totalHistories, rows };
  }, [data]);

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center gap-2 py-20">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading appointment history</span>
      </div>
    );
  }


  return (
    <div className="space-y-6 mb-24 mt-24">
      <Card className="dark:bg-gray-900 p-2">
        <CardHeader>
          <CardTitle className="text-xl mt-2 text-center ">
            Appointment Details Table
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table className="w-full table-fixed">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[19%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[5%]" />
                <col className="w-[20%]" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">SL</TableHead>
                  <TableHead className="text-center">Doctor</TableHead>
                  <TableHead className="text-center">Phone</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center">Speciality</TableHead>
                  <TableHead className="text-center">Degree</TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-sm text-muted-foreground"
                    >
                      No appointments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell className="text-center whitespace-normal break-words">
                        {r.doctorName}
                      </TableCell>
                      <TableCell className="text-center whitespace-normal break-words">
                        {r.doctorPhone}
                      </TableCell>
                      <TableCell className="text-center whitespace-normal break-words">
                        {r.doctorEmail}
                      </TableCell>
                      <TableCell className="text-center whitespace-normal break-words">
                        {r.speciality}
                      </TableCell>
                      <TableCell className="text-center whitespace-normal break-words">
                        {r.degree}
                      </TableCell>
                      <TableCell className="text-center">{r.date}</TableCell>
                      <TableCell className="text-center">{r.time}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
