"use client";

import { useMemo } from "react";
import {
  useGetAppointmentsQuery,
  Appointment,
  MedicalHistory,
} from "@/services/appointmentApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Loader2Icon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AppointmentHistory from "./AppointmentHistory";

export default function PatientAnalytics() {
  const { data = [], isLoading, isFetching, error } = useGetAppointmentsQuery();

  const { totalAppointments, totalHistories, monthData, upcomingCount } =
    useMemo(() => {
      const appointments = data as Appointment[];
      const totalAppointments = appointments.length;
      const firstWithPatient = appointments.find((a) => a.patient?.histories);
      const histories = (firstWithPatient?.patient?.histories ||
        []) as MedicalHistory[];
      const totalHistories = histories.length;

      const now = new Date();
      const upcomingCount = appointments.filter(
        (a) => new Date(a.startTime) > now
      ).length;

      const byMonth = new Map<string, number>();
      appointments.forEach((a) => {
        const d = new Date(a.startTime);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        byMonth.set(key, (byMonth.get(key) || 0) + 1);
      });
      const monthData = Array.from(byMonth.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([m, count]) => ({ month: m, appointments: count }));

      return { totalAppointments, totalHistories, monthData, upcomingCount };
    }, [data]);

  if (isLoading || isFetching) {
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Loading Dashboard <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-600">
        Failed to load. Please refresh.
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center">
                {totalAppointments}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center">
                {upcomingCount}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-pink-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Medical Histories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center">
                {totalHistories}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12 dark:bg-gray-800 bg-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Appointments by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="appointments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <AppointmentHistory />
      </div>
    </div>
  );
}
