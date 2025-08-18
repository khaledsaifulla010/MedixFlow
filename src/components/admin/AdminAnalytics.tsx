// app/(admin)/admin/analytics/AdminAnalytics.tsx
"use client";

import * as React from "react";
import { useGetAllUsersQuery } from "@/services/usersApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

export default function AdminAnalytics() {
  const {
    data: users,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetAllUsersQuery();

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
          Loading Analytics
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 space-y-3 text-center">
        <p className="text-red-600 text-sm">Failed to load analytics.</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => refetch()}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Retry
          </button>
        </div>
        <pre className="text-xs text-gray-400 max-w-full overflow-auto">
          {String((error as any)?.data || (error as any)?.message || error)}
        </pre>
      </div>
    );
  }

  const list = users ?? [];

  const totalUsers = list.length;
  const totalDoctors = list.filter((u) => u.role === "doctor").length;
  const totalPatients = list.filter((u) => u.role === "patient").length;

  // derive total appointments from doctors' counts
  const totalAppointments = list
    .filter((u) => u.role === "doctor")
    .reduce((sum, u) => sum + (u.doctorProfile?._count.appointments ?? 0), 0);

  const chartAData = [
    { name: "Users", value: totalUsers },
    { name: "Appointments", value: totalAppointments },
  ];
  const chartBData = [
    { name: "Patients", value: totalPatients },
    { name: "Doctors", value: totalDoctors },
  ];

  return (
    <div className="p-6 space-y-6 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center bg-green-600 ">
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold -mt-4">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-purple-600">
          <CardHeader>
            <CardTitle className="text-lg">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold -mt-4">{totalPatients}</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-pink-600">
          <CardHeader>
            <CardTitle className="text-lg">Total Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold -mt-4">{totalDoctors}</div>
          </CardContent>
        </Card>
        <Card className="text-center  bg-orange-600">
          <CardHeader>
            <CardTitle className="text-lg">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold -mt-4">{totalAppointments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6 mt-16">
        <Card className="flex-1 text-center dark:bg-gray-800 bg-gray-200 border-2">
          <CardHeader>
            <CardTitle className="text-base">
              Total Appointments vs Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartAData}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex-1 text-center dark:bg-gray-800 bg-gray-200 border-2">
          <CardHeader>
            <CardTitle className="text-base">
              Total Patients vs Total Doctors
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartBData}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
