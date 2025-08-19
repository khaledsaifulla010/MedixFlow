"use client";

import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core/index.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetAvailabilitiesQuery,
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  Appointment,
  MedicalHistory,
} from "@/services/appointmentApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const formatDisplayDate = (date: Date) =>
  `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;

const timeStringToDate = (date: Date, time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

const dateToHM = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0"
  )}`;

const addMinutes = (d: Date, mins: number) =>
  new Date(d.getTime() + mins * 60000);

function buildTimeOptions(start: Date, end: Date, stepMin = 15) {
  const opts: { value: string; label: string }[] = [];
  const s = new Date(start);
  s.setSeconds(0, 0);
  const e = new Date(end);
  e.setSeconds(0, 0);
  for (let cur = new Date(s); cur <= e; cur = addMinutes(cur, stepMin)) {
    const value = dateToHM(cur);
    opts.push({ value, label: value });
  }
  return opts;
}

type BookingCtx = {
  doctorId: string;
  doctorName: string;
  speciality: string;
  degree: string;
  availStart: Date;
  availEnd: Date;
  startHM: string;
  endHM: string;
};

export default function AppointmentDetailsPage() {
  const {
    data: availabilities = [],
    isLoading: isAvailLoading,
    isFetching: isAvailFetching,
    error: availError,
  } = useGetAvailabilitiesQuery();

  const {
    data: appointments = [],
    isLoading: isApptLoading,
    isFetching: isApptFetching,
    error: apptError,
  } = useGetAppointmentsQuery();

  const [createAppointment, { isLoading: isCreating }] =
    useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booking, setBooking] = useState<BookingCtx | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const isBusy =
    isAvailLoading ||
    isApptLoading ||
    isAvailFetching ||
    isApptFetching ||
    isCreating ||
    isUpdating;

  const checkConflict = (
    start: Date,
    end: Date,
    doctorId: string,
    excludeId?: string
  ) => {
    const doctorAvail = (availabilities as any[]).filter(
      (a) => a.doctorId === doctorId
    );
    const inAvail = doctorAvail.some((a) => {
      let availStart: Date, availEnd: Date;
      if (a.isRecurring) {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const targetDay = new Date(startOfWeek);
        let diff = (a.dayOfWeek ?? 0) - targetDay.getDay();
        if (diff < 0) diff += 7;
        targetDay.setDate(targetDay.getDate() + diff);
        availStart = timeStringToDate(targetDay, a.startTime);
        availEnd = timeStringToDate(targetDay, a.endTime);
      } else {
        availStart = new Date(`${a.date}T${a.startTime}`);
        availEnd = new Date(`${a.date}T${a.endTime}`);
      }
      return start >= availStart && end <= availEnd;
    });
    if (!inAvail) return "Outside doctor's availability";
    const conflict = (appointments as Appointment[]).some(
      (ap) =>
        ap.doctorId === doctorId &&
        ap.id !== excludeId &&
        start < new Date(ap.endTime) &&
        end > new Date(ap.startTime)
    );
    if (conflict) return "Slot already booked";
    return null;
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const event = info.event;
    const start = event.start!;
    const end = event.end!;
    const doctorId = (event.extendedProps as any).doctorId;
    const conflictMsg = checkConflict(
      start,
      end,
      doctorId,
      event.id.replace("appointment-", "")
    );
    if (conflictMsg) {
      toast.error(conflictMsg);
      info.revert();
      return;
    }
    try {
      if (event.id.startsWith("appointment-")) {
        await updateAppointment({
          appointmentId: event.id.replace("appointment-", ""),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }).unwrap();
        toast.success("Appointment Rescheduled");
      }
    } catch (err: any) {
      toast.error(err?.data?.error || "Operation failed");
      info.revert();
    }
  };

  const handleEventClick = async (info: EventClickArg) => {
    const e = info.event;
    const isAppointment = e.id.startsWith("appointment-");
    const isAvailability = e.id.startsWith("availability-");
    if (isAvailability) {
      const doctorId = (e.extendedProps as any).doctorId as string;
      const doctorName = e.title as string;
      const speciality = (e.extendedProps as any).speciality as string;
      const degree = (e.extendedProps as any).degree as string;
      const availStart = e.start!;
      const availEnd = e.end!;
      const defStartHM = dateToHM(availStart);
      const defEnd = addMinutes(availStart, 30);
      const defEndClamped = defEnd > availEnd ? availEnd : defEnd;
      const defEndHM = dateToHM(defEndClamped);
      setBooking({
        doctorId,
        doctorName,
        speciality,
        degree,
        availStart,
        availEnd,
        startHM: defStartHM,
        endHM: defEndHM,
      });
      setBookingOpen(true);
      return;
    }
    if (isAppointment) {
      const ex = e.extendedProps as {
        patientName?: string;
        patientHistories?: MedicalHistory[];
        degree?: string;
      };
      const histories: MedicalHistory[] = ex?.patientHistories ?? [];
      setDialogContent(
        <div className="space-y-3">
          <p>
            <strong>Patient Name:</strong> {ex?.patientName || "Patient"}
          </p>
          <p>
            <strong>Appointment Time:</strong> {e.start?.toLocaleTimeString()} -{" "}
            {e.end?.toLocaleTimeString()}
          </p>
          <div className="mt-4">
            <h4 className="font-semibold">Patient Medical History</h4>
            {histories.length > 0 ? (
              <ul className="list-disc ml-5 space-y-2">
                {histories.map((h: MedicalHistory) => (
                  <li key={h.id}>
                    {h.allergies && (
                      <div>
                        <span className="font-medium">Allergies:</span>{" "}
                        {h.allergies}
                      </div>
                    )}
                    {h.pastTreatments && (
                      <div>
                        <span className="font-medium">Past Treatments:</span>{" "}
                        {h.pastTreatments}
                      </div>
                    )}
                    {h.files?.length ? (
                      <div>
                        <span className="font-medium">Files:</span>{" "}
                        {h.files.map((f: string, idx: number) => (
                          <a
                            key={idx}
                            href={f}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline mr-2"
                          >
                            File {idx + 1}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    <div className="text-xs text-gray-500">
                      Added: {new Date(h.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No medical history found.</p>
            )}
          </div>
        </div>
      );
      setDialogOpen(true);
    }
  };

  const handleSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent({
      id: "selected-slot",
      title: "Selected Slot",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      backgroundColor: "#EF4444",
      borderColor: "#DC2626",
      textColor: "white",
      editable: false,
    });
  };

  const today = new Date();
  const events: any[] = [];

  (availabilities as any[]).forEach((a) => {
    if (a.isRecurring) {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(day.getDate() + i);
        if (a.dayOfWeek === day.getDay()) {
          const start = timeStringToDate(day, a.startTime);
          const end = timeStringToDate(day, a.endTime);
          events.push({
            id: `availability-${a.id}-${i}`,
            title: `${a.doctor.user.name} (${a.doctor.degree}, ${a.doctor.speciality})`,
            start,
            end,
            backgroundColor: "#34D399",
            borderColor: "#10B981",
            textColor: "white",
            editable: true,
            extendedProps: {
              speciality: a.doctor.speciality,
              degree: a.doctor.degree,
              doctorId: a.doctor.id,
            },
          });
        }
      }
    } else if (a.date) {
      const start = new Date(`${a.date}T${a.startTime}`);
      const end = new Date(`${a.date}T${a.endTime}`);
      events.push({
        id: `availability-${a.id}`,
        title: `${a.doctor.user.name} (${a.doctor.degree}, ${a.doctor.speciality})`,
        start,
        end,
        backgroundColor: "#34D399",
        borderColor: "#10B981",
        textColor: "white",
        editable: true,
        extendedProps: {
          speciality: a.doctor.speciality,
          degree: a.doctor.degree,
          doctorId: a.doctor.id,
        },
      });
    }
  });

  (appointments as Appointment[]).forEach((ap) => {
    events.push({
      id: `appointment-${ap.id}`,
      title: `Booked`,
      start: ap.startTime,
      end: ap.endTime,
      backgroundColor: "#EF4444",
      borderColor: "#DC2626",
      textColor: "white",
      editable: true,
      extendedProps: {
        speciality: ap.doctor.speciality,
        degree: ap.doctor.degree,
        doctorId: ap.doctorId,
        patientName: ap.patient?.user?.name ?? "Patient",
        patientHistories: ap.patient?.histories ?? [],
      },
    });
  });

  const isLoadingAny = useMemo(
    () => isBusy || (availError as any) || (apptError as any),
    [isBusy, availError, apptError]
  );

  const startOptions = useMemo(() => {
    if (!booking) return [];
    return buildTimeOptions(booking.availStart, booking.availEnd, 15);
  }, [booking]);

  const endOptions = useMemo(() => {
    if (!booking) return [];
    const baseDate = new Date(
      booking.availStart.getFullYear(),
      booking.availStart.getMonth(),
      booking.availStart.getDate()
    );
    const start = timeStringToDate(baseDate, booking.startHM);
    const minEnd = addMinutes(start, 15);
    const clampStart =
      minEnd < booking.availStart ? booking.availStart : minEnd;
    return buildTimeOptions(clampStart, booking.availEnd, 15);
  }, [booking?.startHM, booking?.availStart, booking?.availEnd]);

  if (isLoadingAny) {
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Loading Appointments
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-4">

      <div className="p-4 border-2 rounded-md">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,dayGridMonth,listWeek",
          }}
          initialView="timeGridWeek"
          nowIndicator
          selectable
          editable
          eventDurationEditable
          select={handleSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          events={selectedEvent ? [...events, selectedEvent] : events}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          dayHeaderContent={(args) => {
            const dayName = args.date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const dayDate = formatDisplayDate(args.date);
            return (
              <div className="flex flex-col text-center">
                <span className="font-semibold text-gray-700">{dayName}</span>
                <span className="text-gray-500 text-sm">{dayDate}</span>
              </div>
            );
          }}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Details</DialogTitle>
              <DialogClose />
            </DialogHeader>
            <div className="mt-2">{dialogContent}</div>
          </DialogContent>
        </Dialog>
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl">Book Appointment</DialogTitle>
            </DialogHeader>
            <div className="border-b-2"></div>
            {booking && (
              <div className="space-y-4">
                <div className="text-lg">
                  <div>
                    <strong>Doctor :</strong> {booking.doctorName}
                  </div>
                  <div>
                    <strong>Degree :</strong> {booking.degree}
                  </div>
                  <div>
                    <strong>Speciality :</strong> {booking.speciality}
                  </div>
                  <div>
                    <strong>Availability:</strong>{" "}
                    {booking.availStart.toLocaleTimeString()} -{" "}
                    {booking.availEnd.toLocaleTimeString()} on{" "}
                    {booking.availStart.toLocaleDateString()}
                  </div>
                </div>
                <div className="border-b-2"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Start time
                    </label>
                    <Select
                      value={booking.startHM}
                      onValueChange={(val) => {
                        const baseDate = new Date(
                          booking.availStart.getFullYear(),
                          booking.availStart.getMonth(),
                          booking.availStart.getDate()
                        );
                        const newStart = timeStringToDate(baseDate, val);
                        const currentEnd = timeStringToDate(
                          baseDate,
                          booking.endHM
                        );
                        let newEnd = currentEnd;
                        if (!(newStart < currentEnd)) {
                          newEnd = addMinutes(newStart, 30);
                          if (newEnd > booking.availEnd)
                            newEnd = booking.availEnd;
                        }
                        setBooking({
                          ...booking,
                          startHM: val,
                          endHM: dateToHM(newEnd),
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {startOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      End time
                    </label>
                    <Select
                      value={booking.endHM}
                      onValueChange={(val) =>
                        setBooking({
                          ...booking,
                          endHM: val,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {endOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setBookingOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!booking) return;
                      const { doctorId, availStart, availEnd, startHM, endHM } =
                        booking;
                      if (!startHM || !endHM) {
                        toast.error("Please choose start and end time");
                        return;
                      }
                      const baseDate = new Date(
                        availStart.getFullYear(),
                        availStart.getMonth(),
                        availStart.getDate()
                      );
                      const start = timeStringToDate(baseDate, startHM);
                      const end = timeStringToDate(baseDate, endHM);
                      if (!(start < end)) {
                        toast.error("End time must be after start time");
                        return;
                      }
                      if (start < availStart || end > availEnd) {
                        toast.error(
                          "Selected times must be within availability"
                        );
                        return;
                      }
                      const conflictMsg = checkConflict(start, end, doctorId);
                      if (conflictMsg) {
                        toast.error(conflictMsg);
                        return;
                      }
                      try {
                        await createAppointment({
                          doctorId,
                          startTime: start.toISOString(),
                          endTime: end.toISOString(),
                        }).unwrap();
                        toast.success("Appointment created");
                        setBookingOpen(false);
                      } catch (err: any) {
                        toast.error(
                          err?.data?.error || "Failed to create appointment"
                        );
                      }
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
