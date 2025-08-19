import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  getOnlineAppointmentReminderEmail,
  sendEmailReminder,
} from "@/services/emailService";
import { getRescheduleAppointmentEmail } from "@/services/rescheduleEmail";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

async function verifyToken() {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    return { userId: decoded.id };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60000);
}

type WindowUTC = { start: Date; end: Date };

async function findNextFreeSlotOrNull(params: {
  doctorId: string;
  refStart: Date;
  durationMin: number;
  searchDays?: number;
}) {
  const { doctorId, refStart, durationMin, searchDays = 60 } = params;

  const allAvail = await prisma.doctorAvailability.findMany({
    where: { doctorId },
  });

  const futureAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      endTime: { gt: refStart },
    },
    select: { startTime: true, endTime: true },
    orderBy: { startTime: "asc" },
  });

  for (let dayOffset = 0; dayOffset <= searchDays; dayOffset++) {
    const day = new Date(refStart);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + dayOffset);
    const dayStr = formatDate(day);
    const dow = day.getDay();
    const dayWindows: WindowUTC[] = [];
    for (const a of allAvail) {
      if (a.isRecurring) {
        if (a.dayOfWeek !== dow) continue;
        const wStart = new Date(`${dayStr}T${a.startTime}`);
        const wEnd = new Date(`${dayStr}T${a.endTime}`);
        dayWindows.push({ start: wStart, end: wEnd });
      } else if (a.date === dayStr) {
        const wStart = new Date(`${a.date}T${a.startTime}`);
        const wEnd = new Date(`${a.date}T${a.endTime}`);
        dayWindows.push({ start: wStart, end: wEnd });
      }
    }
    if (!dayWindows.length) continue;

    for (const w of dayWindows.sort((x, y) => +x.start - +y.start)) {

      let curStart =
        refStart >= w.start && refStart <= w.end ? refStart : w.start;

      while (true) {
        const curEnd = addMinutes(curStart, durationMin);
        if (curEnd > w.end) break; 


        const overlaps = futureAppointments.filter(
          (ap) => curStart < ap.endTime && curEnd > ap.startTime
        );

        if (overlaps.length === 0) {
          return { start: curStart, end: curEnd };
        }
        const jumpTo = overlaps.reduce(
          (mx, ap) => (ap.endTime > mx ? ap.endTime : mx),
          curStart
        );
        if (jumpTo <= curStart) break;
        curStart = jumpTo;
      }
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const auth = await verifyToken();
    if ("error" in auth)
      return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { doctorId, startTime, endTime } = await req.json();
    if (!doctorId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "doctorId, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
    });
    if (!doctor)
      return NextResponse.json({ error: "Doctor not found" }, { status: 400 });

    const patient = await prisma.patientProfile.findUnique({
      where: { userId: auth.userId },
    });
    if (!patient)
      return NextResponse.json({ error: "Patient not found" }, { status: 400 });


    const availabilities = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        OR: [
          { isRecurring: true, dayOfWeek: start.getDay() },
          { isRecurring: false, date: formatDate(start) },
        ],
      },
    });
    if (!availabilities.length) {

      const durationMin = Math.max(15, Math.round((+end - +start) / 60000));
      const next = await findNextFreeSlotOrNull({
        doctorId,
        refStart: start,
        durationMin,
      });
      if (!next) {
        return NextResponse.json(
          { error: "Doctor not available" },
          { status: 400 }
        );
      }

      const appointment = await prisma.appointment.create({
        data: {
          doctorId,
          patientId: patient.id,
          startTime: next.start,
          endTime: next.end,
        },
        include: {
          doctor: { include: { user: true } },
          patient: {
            include: {
              user: true,
              histories: true,
            },
          },
        },
      });
      if (appointment.patient?.user?.email) {
        const { htmlMessage, textMessage } = getOnlineAppointmentReminderEmail(
          appointment.doctor.user.name,
          appointment.doctor.degree || "",
          appointment.doctor.speciality || "",
          appointment.patient.user.name,
          appointment.startTime
        );

        await sendEmailReminder(
          appointment.patient.user.email,
          "Appointment Confirmation",
          htmlMessage,
          textMessage
        );
      }
      return NextResponse.json(appointment);
    }

    const isInsideAvailability = availabilities.some((a) => {
      const availStart = a.isRecurring
        ? new Date(`${formatDate(start)}T${a.startTime}`)
        : new Date(`${a.date}T${a.startTime}`);
      const availEnd = a.isRecurring
        ? new Date(`${formatDate(start)}T${a.endTime}`)
        : new Date(`${a.date}T${a.endTime}`);
      return start >= availStart && end <= availEnd;
    });

    if (!isInsideAvailability) {

      const durationMin = Math.max(15, Math.round((+end - +start) / 60000));
      const next = await findNextFreeSlotOrNull({
        doctorId,
        refStart: start,
        durationMin,
      });
      if (!next) {
        return NextResponse.json(
          { error: "Selected time is outside doctor's availability" },
          { status: 400 }
        );
      }

      const appointment = await prisma.appointment.create({
        data: {
          doctorId,
          patientId: patient.id,
          startTime: next.start,
          endTime: next.end,
        },
        include: {
          doctor: { include: { user: true } },
          patient: {
            include: {
              user: true,
              histories: true,
            },
          },
        },
      });

      if (appointment.patient?.user?.email) {
        const { htmlMessage, textMessage } = getOnlineAppointmentReminderEmail(
          appointment.doctor.user.name,
          appointment.doctor.degree || "",
          appointment.doctor.speciality || "",
          appointment.patient.user.name,
          appointment.startTime
        );

        await sendEmailReminder(
          appointment.patient.user.email,
          "Appointment Confirmation",
          htmlMessage,
          textMessage
        );
      }

      return NextResponse.json(appointment);
    }

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflict)
      return NextResponse.json(
        { error: "Selected slot is already booked" },
        { status: 400 }
      );

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: patient.id,
        startTime: start,
        endTime: end,
      },
      include: {
        doctor: { include: { user: true } },
        patient: {
          include: {
            user: true,
            histories: true,
          },
        },
      },
    });

    if (appointment.patient?.user?.email) {
      const { htmlMessage, textMessage } = getOnlineAppointmentReminderEmail(
        appointment.doctor.user.name,
        appointment.doctor.degree || "",
        appointment.doctor.speciality || "",
        appointment.patient.user.name,
        appointment.startTime
      );

      await sendEmailReminder(
        appointment.patient.user.email,
        "Appointment Confirmation",
        htmlMessage,
        textMessage
      );
    }

    return NextResponse.json(appointment);
  } catch (err) {
    console.error("POST /api/patient/appointment error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const auth = await verifyToken();
    if ("error" in auth)
      return NextResponse.json({ error: auth.error }, { status: auth.status });

    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    let appointments;

    if (user.role === "doctor") {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: auth.userId },
      });
      if (!doctor)
        return NextResponse.json(
          { error: "Doctor not found" },
          { status: 400 }
        );

      appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: {
          doctor: { include: { user: true } },
          patient: {
            include: {
              user: true,
              histories: true,
            },
          },
        },
        orderBy: { startTime: "asc" },
      });
    } else if (user.role === "patient") {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: auth.userId },
      });
      if (!patient)
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 400 }
        );

      appointments = await prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: { include: { user: true } },
          patient: {
            include: {
              user: true,
              histories: true,
            },
          },
        },
        orderBy: { startTime: "asc" },
      });
    } else {
      return NextResponse.json(
        { error: "Role not supported" },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: appointments });
  } catch (err) {
    console.error("GET /api/appointment error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await verifyToken();
    if ("error" in auth)
      return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { appointmentId, startTime, endTime } = await req.json();
    if (!appointmentId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "appointmentId, startTime, and endTime are required" },
        { status: 400 }
      );
    }
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });
    if (!appointment)
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );

    if (appointment.patient.userId !== auth.userId)
      return NextResponse.json(
        { error: "Not your appointment" },
        { status: 403 }
      );

    const start = new Date(startTime);
    const end = new Date(endTime);
    const availabilities = await prisma.doctorAvailability.findMany({
      where: {
        doctorId: appointment.doctorId,
        OR: [
          { isRecurring: true, dayOfWeek: start.getDay() },
          { isRecurring: false, date: formatDate(start) },
        ],
      },
    });

    const isInsideAvailability = availabilities.some((a) => {
      const availStart = a.isRecurring
        ? new Date(`${formatDate(start)}T${a.startTime}`)
        : new Date(`${a.date}T${a.startTime}`);
      const availEnd = a.isRecurring
        ? new Date(`${formatDate(start)}T${a.endTime}`)
        : new Date(`${a.date}T${a.endTime}`);
      return start >= availStart && end <= availEnd;
    });
    if (!isInsideAvailability)
      return NextResponse.json(
        { error: "Outside doctor's availability" },
        { status: 400 }
      );
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: appointment.doctorId,
        id: { not: appointment.id },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflict)
      return NextResponse.json(
        { error: "Slot already booked" },
        { status: 400 }
      );
    const prevStart = appointment.startTime;
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { startTime: start, endTime: end },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });
    if (updated.patient?.user?.email) {
      const { subject, htmlMessage, textMessage } =
        getRescheduleAppointmentEmail(
          updated.doctor.user.name,
          updated.doctor.degree || "",
          updated.doctor.speciality || "",
          updated.patient.user.name,
          updated.startTime,
          prevStart
        );

      await sendEmailReminder(
        updated.patient.user.email,
        subject,
        htmlMessage,
        textMessage
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/patient/appointment error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
