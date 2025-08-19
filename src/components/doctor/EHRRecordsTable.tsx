"use client";

import { useMemo, useState } from "react";
import {
  useGetAppointmentsQuery,
  Appointment,
  MedicalHistory,
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
import { Badge } from "@/components/ui/badge";
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
  })} - ${e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
function latestHistory(histories: MedicalHistory[] | undefined) {
  if (!histories || histories.length === 0) return undefined;
  return [...histories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

export default function EHRRecordsTable() {
  const { data = [], isLoading, isFetching, error } = useGetAppointmentsQuery();
  const [search, setSearch] = useState("");
  const [recordFilter, setRecordFilter] = useState<"all" | "existing" | "new">(
    "all"
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const rows = useMemo(() => {
    let list = (data as Appointment[]).map((ap) => {
      const patient = ap.patient?.user;
      const hasHistory = (ap.patient?.histories?.length || 0) > 0;
      const h = latestHistory(ap.patient?.histories);
      return {
        id: ap.id,
        patientName: patient?.name ?? "Unknown",
        patientEmail: patient?.email ?? "-",
        date: formatDate(ap.startTime),
        time: formatTimeRange(ap.startTime, ap.endTime),
        hasHistory,
        allergies: h?.allergies ?? "Not added",
        pastTreatments: h?.pastTreatments ?? "Not added",
        files: h?.files ?? [],
        createdAt: ap.startTime,
      };
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.patientEmail.toLowerCase().includes(q)
      );
    }

    if (recordFilter === "existing") list = list.filter((r) => r.hasHistory);
    else if (recordFilter === "new") list = list.filter((r) => !r.hasHistory);

    list.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return list;
  }, [data, search, recordFilter, sortOrder]);

  if (isLoading || isFetching) {
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Loading EHR Record
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
    <div className="space-y-5">
      <div className="mt-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name or email"
          className="sm:w-80 text-center"
        />
        <div className="flex gap-5">
          <Select
            value={recordFilter}
            onValueChange={(v: "all" | "existing" | "new") =>
              setRecordFilter(v)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Record filter" />
            </SelectTrigger>
            <SelectContent align="center">
              <SelectItem value="all">All patients</SelectItem>
              <SelectItem value="existing">With history</SelectItem>
              <SelectItem value="new">New patients</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      <div className="rounded-md border">
        <Table className="w-full table-fixed">
          <colgroup>
            <col className="w-[2%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[18%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
          </colgroup>

          <TableHeader>
            <TableRow>
              <TableHead className="text-center">SL</TableHead>
              <TableHead className="text-center">Patient</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Booked Date</TableHead>
              <TableHead className="text-center">Time</TableHead>
              <TableHead className="text-center">Allergies</TableHead>
              <TableHead className="text-center">Past Treatments</TableHead>
              <TableHead className="text-center">Files</TableHead>
              <TableHead className="text-center">Record</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="font-bold text-xl mt-36 flex items-center justify-center gap-4"
                >
                  No EHR Record Found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell className="text-center whitespace-normal break-words">
                    <span className="font-medium">{r.patientName}</span>
                  </TableCell>
                  <TableCell className="text-center whitespace-normal break-words">
                    {r.patientEmail}
                  </TableCell>
                  <TableCell className="text-center">{r.date}</TableCell>
                  <TableCell className="text-center">{r.time}</TableCell>
                  <TableCell
                    className={`text-center whitespace-normal break-words ${
                      r.allergies === "Not added" ? "text-muted-foreground" : ""
                    }`}
                  >
                    {r.allergies}
                  </TableCell>
                  <TableCell
                    className={`text-center whitespace-normal break-words ${
                      r.pastTreatments === "Not added"
                        ? "text-muted-foreground"
                        : ""
                    }`}
                  >
                    {r.pastTreatments}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.files.length ? (
                      <div className="flex flex-col items-center gap-1">
                        {r.files.map((f, idx) => (
                          <a
                            key={idx}
                            href={f}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs"
                          >
                            File {idx + 1}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not added</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.hasHistory ? (
                      <Badge className="bg-purple-600 text-white">
                        Existing
                      </Badge>
                    ) : (
                      <Badge className="bg-green-600 text-white">New</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
