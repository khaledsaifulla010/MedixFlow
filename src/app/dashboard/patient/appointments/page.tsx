"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import type {
  DateSelectArg,
  EventDropArg,
  EventClickArg,
} from "@fullcalendar/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface Doctor {
  id: string;
  user: { name: string };
  speciality: string;
}
interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  doctor: Doctor;
  patient: { id: string; user: { name: string } };
}
interface Availability {
  id: string;
  doctorId: string;
  doctor: Doctor;
  date: string | null;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  dayOfWeek?: number;
}
interface ApiResponse {
  appointments: Appointment[];
  availabilities: Availability[];
}

const formatDate = (date: Date) => date.toISOString().split("T")[0];
const formatDisplayDate = (date: Date) =>
  `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;

const timeStringToDate = (date: Date, time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);

  const fetchData = async () => {
    try {
      const res = await axios.get<ApiResponse>("/api/appointments");
      setAppointments(res.data.appointments);
      setAvailabilities(res.data.availabilities);
    } catch (err: any) {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelect = async (selectInfo: DateSelectArg) => {
    const { start, end } = selectInfo;
    const availability = availabilities.find((a) =>
      a.isRecurring
        ? a.dayOfWeek === start.getDay()
        : a.date && formatDate(new Date(a.date)) === formatDate(start)
    );

    if (!availability) return toast.error("No doctor available for this time");

    const availStart = timeStringToDate(start, availability.startTime);
    const availEnd = timeStringToDate(start, availability.endTime);

    if (start < availStart || end > availEnd)
      return toast.error(
        `Selected time must be ${availability.startTime}-${availability.endTime}`
      );

    const conflict = appointments.find(
      (a) =>
        a.doctor.id === availability.doctorId &&
        new Date(a.startTime) < end &&
        new Date(a.endTime) > start
    );
    if (conflict) return toast.error("Slot already booked");

    try {
      await axios.post("/api/appointments", {
        doctorId: availability.doctorId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      toast.success("Appointment Booked Successfully!");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to book appointment");
    }
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const e = info.event;
    try {
      await axios.post("/api/appointments", {
        doctorId: e.extendedProps.doctorId,
        patientId: e.extendedProps.patientId,
        startTime: e.start?.toISOString(),
        endTime: e.end?.toISOString(),
      });
      toast.success("Appointment updated!");
      fetchData();
    } catch (err: any) {
      info.revert();
      toast.error("Cannot move appointment");
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const e = info.event;
    const color = e.backgroundColor;

    if (color === "#22C55E") {
      const availability = availabilities.find(
        (a) => `availability-${a.id}` === e.id
      );
      if (!availability) return;

      const doctor = availability.doctor;

      const availStart = availability.date
        ? timeStringToDate(new Date(availability.date), availability.startTime)
        : null;
      const availEnd = availability.date
        ? timeStringToDate(new Date(availability.date), availability.endTime)
        : null;

      const bookedAppointments = appointments.filter(
        (a) =>
          a.doctor.id === doctor.id &&
          availStart &&
          availEnd &&
          new Date(a.startTime) >= availStart &&
          new Date(a.startTime) < availEnd
      );

      setDialogContent(
        <div className="space-y-2">
          <div>
            <strong>Doctor Name:</strong> {doctor.user.name}
          </div>
          <div>
            <strong>Speciality:</strong> {doctor.speciality}
          </div>
          <div>
            <strong>Available Time:</strong> {availStart?.toLocaleTimeString()}{" "}
            - {availEnd?.toLocaleTimeString()}
          </div>
          {bookedAppointments.length > 0 && (
            <div>
              <strong>Booked Appointments:</strong>
              <ul className="ml-4 list-disc">
                {bookedAppointments.map((a) => (
                  <li key={a.id}>
                    {a.patient.user.name} (
                    {new Date(a.startTime).toLocaleTimeString()} -{" "}
                    {new Date(a.endTime).toLocaleTimeString()})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } else if (color === "#EF4444") {
      // Red: show doctor + patient info
      const appointment = appointments.find(
        (a) => `appointment-${a.id}` === e.id
      );
      if (!appointment) return;

      setDialogContent(
        <div className="space-y-2">
          <div>
            <strong>Doctor Name:</strong> {appointment.doctor.user.name}
          </div>
          <div>
            <strong>Doctor Speciality:</strong> {appointment.doctor.speciality}
          </div>
          <div>
            <strong>Patient Name:</strong>{" "}
            {appointment.patient?.user?.name || e.extendedProps.patientName}
          </div>
          <div>
            <strong>Appointment Time:</strong>{" "}
            {new Date(appointment.startTime).toLocaleTimeString()} -{" "}
            {new Date(appointment.endTime).toLocaleTimeString()}
          </div>
        </div>
      );
    }

    setDialogOpen(true);
  };

  const calendarEvents = [
    ...appointments.map((a) => ({
      id: `appointment-${a.id}`,
      title: `${a.patient.user.name} → ${a.doctor.user.name}`,
      start: a.startTime,
      end: a.endTime,
      color: "#EF4444",
      textColor: "white",
      extendedProps: { doctorId: a.doctor.id, patientId: a.patient.id },
    })),
    ...availabilities.map((a) => {
      const today = new Date();
      const datePart = a.isRecurring
        ? (() => {
            const diff = (a.dayOfWeek ?? 0) - today.getDay();
            const target = new Date(today);
            target.setDate(today.getDate() + diff);
            return formatDate(target);
          })()
        : a.date
        ? formatDate(new Date(a.date))
        : "";
      return {
        id: `availability-${a.id}`,
        title: `${a.doctor.user.name} (${a.doctor.speciality})`,
        start: `${datePart}T${a.startTime}`,
        end: `${datePart}T${a.endTime}`,
        color: "#22C55E",
        textColor: "white",
        extendedProps: { doctorId: a.doctor.id },
      };
    }),
  ];

  return (
    <div className="p-4 border-2 rounded-md">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,dayGridMonth,listWeek",
        }}
        initialView="timeGridWeek"
        nowIndicator={true}
        selectable
        editable
        select={handleSelect}
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        events={calendarEvents}
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
        slotLabelContent={(arg) => {
          const date = arg.date;
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const hour12 = hours % 12 === 0 ? 12 : hours % 12;
          const ampm = hours >= 12 ? "PM" : "AM";
          return (
            <span className="text-gray-500 text-sm">
              {hour12}:{minutes.toString().padStart(2, "0")} {ampm}
            </span>
          );
        }}
        slotLabelFormat={{ hour: "numeric", minute: "2-digit", hour12: true }}
        dayMaxEventRows={true}
        themeSystem="standard"
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
    </div>
  );
}
