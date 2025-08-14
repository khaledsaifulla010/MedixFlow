import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  sendEmailReminder,
  getOnlineAppointmentReminderEmail,
} from "@/services/emailService";

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}



export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("accessToken")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const userId = decoded.id;

    const { doctorId, startTime, endTime } = await req.json();
    if (!doctorId || !startTime || !endTime)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1️⃣ Find doctor
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 400 });

    // 2️⃣ Find or create patient
    let patient = await prisma.patientProfile.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!patient) {
      patient = await prisma.patientProfile.create({
        data: { userId, patientId: `PAT-${Date.now()}` },
        include: { user: { select: { name: true, email: true } } },
      });
    }

    // 3️⃣ Check availability
    const availabilities = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        OR: [
          { isRecurring: true, dayOfWeek: start.getDay() },
          { isRecurring: false, date: start.toISOString().split("T")[0] },
        ],
      },
    });

    if (!availabilities.length)
      return NextResponse.json({ error: "Doctor not available" }, { status: 400 });

    const isInsideAvailability = availabilities.some((a) => {
      const availStart = a.isRecurring
        ? new Date(`${start.toISOString().split("T")[0]}T${a.startTime}`)
        : new Date(`${a.date}T${a.startTime}`);
      const availEnd = a.isRecurring
        ? new Date(`${start.toISOString().split("T")[0]}T${a.endTime}`)
        : new Date(`${a.date}T${a.endTime}`);
      return start >= availStart && end <= availEnd;
    });
    if (!isInsideAvailability)
      return NextResponse.json({ error: "Selected time outside availability" }, { status: 400 });

    // 4️⃣ Check conflicts
    const conflict = await prisma.appointment.findFirst({
      where: { doctorId, startTime: { lt: end }, endTime: { gt: start } },
    });
    if (conflict) return NextResponse.json({ error: "Slot already booked" }, { status: 400 });

    // 5️⃣ Create appointment
    const appointment = await prisma.appointment.create({
      data: { doctorId, patientId: patient.id, startTime: start, endTime: end },
      include: {
        doctor: { select: { speciality: true, degree: true, user: { select: { name: true, email: true } } } },
        patient: { select: { user: { select: { name: true, email: true } } } },
      },
    });

    // 6️⃣ Send email
    if (patient.user.email) {
      const { htmlMessage, textMessage } = getOnlineAppointmentReminderEmail(
        doctor.user.name,
        doctor.degree || "",
        doctor.speciality || "",
        patient.user.name,
        appointment.startTime
      );
      await sendEmailReminder(patient.user.email, "Appointment Confirmation", htmlMessage, textMessage);
    }

    return NextResponse.json(appointment);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// GET all appointments
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          select: {
            id: true,
            speciality: true,
            user: { select: { name: true } },
          },
        },
        patient: { select: { id: true, user: { select: { name: true } } } },
      },
    });

    const availabilities = await prisma.doctorAvailability.findMany({
      include: {
        doctor: {
          select: {
            id: true,
            speciality: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({ appointments, availabilities });
  } catch (err) {
    console.error("GET /api/appointments error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
