"use client";

import { useMemo, useState } from "react";
import {
  useGetAllAppointmentsAdminQuery,
  AdminAppointment,
} from "@/services/appointmentApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Loader2Icon } from "lucide-react";

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
  })} - ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function AllAppointmentTable() {
  const {
    data = [],
    isLoading,
    isFetching,
    error,
  } = useGetAllAppointmentsAdminQuery();

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const rows = useMemo(() => {
    let list = (data as AdminAppointment[]).map((ap) => ({
      id: ap.id,
      patientName: ap.patient?.user?.name ?? "-",
      patientEmail: ap.patient?.user?.email ?? "-",
      doctorName: ap.doctor?.user?.name ?? "-",
      doctorEmail: ap.doctor?.user?.email ?? "-",
      date: formatDate(ap.startTime),
      time: formatTimeRange(ap.startTime, ap.endTime),
      createdAt: ap.startTime,
    }));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.patientEmail.toLowerCase().includes(q) ||
          r.doctorName.toLowerCase().includes(q) ||
          r.doctorEmail.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return list;
  }, [data, search, sortOrder]);

  if (isLoading || isFetching) {
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Loading All Appointments <Loader2Icon className="animate-spin" />
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
    <div className="space-y-5">
      <div className="mt-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient/doctor name or email"
          className="sm:w-96 text-center"
        />
        <Select
          value={sortOrder}
          onValueChange={(v: "newest" | "oldest") => setSortOrder(v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent align="center">
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table className="w-full table-fixed">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[17%]" />
            <col className="w-[17%]" />
            <col className="w-[17%]" />
            <col className="w-[17%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
          </colgroup>

          <TableHeader>
            <TableRow>
              <TableHead className="text-center">SL</TableHead>
              <TableHead className="text-center">Patient</TableHead>
              <TableHead className="text-center">Patient Email</TableHead>
              <TableHead className="text-center">Doctor</TableHead>
              <TableHead className="text-center">Doctor Email</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Time</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="font-bold text-xl mt-36 text-center"
                >
                  No Appointment Found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell className="text-center whitespace-normal break-words">
                    {r.patientName}
                  </TableCell>
                  <TableCell className="text-center whitespace-normal break-words">
                    {r.patientEmail}
                  </TableCell>
                  <TableCell className="text-center whitespace-normal break-words">
                    {r.doctorName}
                  </TableCell>
                  <TableCell className="text-center whitespace-normal break-words">
                    {r.doctorEmail}
                  </TableCell>
                  <TableCell className="text-center">{r.date}</TableCell>
                  <TableCell className="text-center">{r.time}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
