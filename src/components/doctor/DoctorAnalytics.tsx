"use client";

import { useMemo } from "react";
import {
  useGetAppointmentsQuery,
  Appointment,
} from "@/services/appointmentApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DoctorAnalytics() {
  const { data = [], isLoading, isFetching, error } = useGetAppointmentsQuery();

  const { totalAppointments, uniquePatients, thisWeek, dailyData } =
    useMemo(() => {
      const appts = data as Appointment[];
      const totalAppointments = appts.length;
      const patientSet = new Set<string>();
      appts.forEach((a) => {
        if (a.patientId) patientSet.add(a.patientId);
      });
      const uniquePatients = patientSet.size;

      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      const thisWeek = appts.filter(
        (a) =>
          new Date(a.startTime) >= startOfWeek &&
          new Date(a.startTime) < endOfWeek
      ).length;

      const byDay = new Map<string, number>();
      for (let i = 0; i < 14; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const key = d.toLocaleDateString();
        byDay.set(key, 0);
      }
      appts.forEach((a) => {
        const key = new Date(a.startTime).toLocaleDateString();
        if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + 1);
      });
      const dailyData = Array.from(byDay.entries()).map(([day, count]) => ({
        day,
        count,
      }));

      return { totalAppointments, uniquePatients, thisWeek, dailyData };
    }, [data]);

  if (isLoading || isFetching) {
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Loading Dashboard
        <Loader2 className="animate-spin" />
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
            <CardTitle className="text-base">Unique Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">
              {uniquePatients}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-pink-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">{thisWeek}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-12 dark:bg-gray-800 bg-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Appointments (Next 2 Weeks)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
