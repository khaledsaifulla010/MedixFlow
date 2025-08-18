"use client";

import { useState } from "react";
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
} from "@/services/appointmentApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const formatDisplayDate = (date: Date) =>
  `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;

const timeStringToDate = (date: Date, time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

export default function AppointmentPage() {
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
    const doctorAvail = availabilities.filter(
      (a: any) => a.doctorId === doctorId
    );

    const isInsideAvailability = doctorAvail.some((a: any) => {
      let startTime: Date, endTime: Date;

      if (a.isRecurring) {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const targetDay = new Date(startOfWeek);
        let diff = (a.dayOfWeek ?? 0) - targetDay.getDay();
        if (diff < 0) diff += 7;
        targetDay.setDate(targetDay.getDate() + diff);
        startTime = timeStringToDate(targetDay, a.startTime);
        endTime = timeStringToDate(targetDay, a.endTime);
      } else {
        startTime = new Date(`${a.date}T${a.startTime}`);
        endTime = new Date(`${a.date}T${a.endTime}`);
      }

      return start >= startTime && end <= endTime;
    });

    if (!isInsideAvailability) return "Outside doctor's availability";

    const conflict = appointments.some(
      (ap: any) =>
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
        toast.success("Appointment rescheduled");
      } else {
        await createAppointment({
          doctorId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }).unwrap();
        toast.success(`Appointment created: ${event.title}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.error || "Operation failed");
      info.revert();
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const e = info.event;
    const isAppointment = e.id.startsWith("appointment-");

    setDialogContent(
      <div>
        {isAppointment ? (
          <>
            <p>
              <strong>Patient Name:</strong>{" "}
              {(e.extendedProps as any).patientName || "You"}
            </p>
            <p>
              <strong>Appointment Time:</strong> {e.start?.toLocaleTimeString()}{" "}
              - {e.end?.toLocaleTimeString()}
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>Doctor Name:</strong> {e.title}
            </p>
            <p>
              <strong>Speciality:</strong> {(e.extendedProps as any).speciality}
            </p>
            <p>
              <strong>Available Time:</strong> {e.start?.toLocaleTimeString()} -{" "}
              {e.end?.toLocaleTimeString()}
            </p>
          </>
        )}
      </div>
    );

    setDialogOpen(true);
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
            title: `${a.doctor.user.name} (${a.doctor.speciality})`,
            start,
            end,
            backgroundColor: "#34D399",
            borderColor: "#10B981",
            textColor: "white",
            editable: true,
            extendedProps: {
              speciality: a.doctor.speciality,
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
        title: `${a.doctor.user.name} (${a.doctor.speciality})`,
        start,
        end,
        backgroundColor: "#34D399",
        borderColor: "#10B981",
        textColor: "white",
        editable: true,
        extendedProps: {
          speciality: a.doctor.speciality,
          doctorId: a.doctor.id,
        },
      });
    }
  });

  (appointments as any[]).forEach((ap) => {
    events.push({
      id: `appointment-${ap.id}`,
      title: `You`,
      start: ap.startTime,
      end: ap.endTime,
      backgroundColor: "#EF4444",
      borderColor: "#DC2626",
      textColor: "white",
      editable: false,
      extendedProps: {
        speciality: ap.doctor.speciality,
        doctorId: ap.doctorId,
        patientName: ap.patient?.user?.name || "You",
      },
    });
  });
  if (isBusy) {
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Loading Appointments
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (availError || apptError) {
    return (
      <div className="mt-10 text-center text-red-600">
        Failed to load data. Please refresh.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h1 className="text-3xl font-bold mb-6">
        Doctor Availabilities & Appointments
      </h1>
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
              <DialogTitle>Doctor Details</DialogTitle>
              <DialogClose />
            </DialogHeader>
            <div className="mt-2">{dialogContent}</div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
