import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const patientId = url.searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId, isRead: false }, // only unread
      include: { doctor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });

    const notifications = appointments.map((appt) => ({
      id: appt.id,
      title: "Appointment Confirmed",
      description: `Your appointment with Dr. ${appt.doctor.user.name} (${appt.doctor.degree}, ${appt.doctor.speciality}) is confirmed.`,
      date: appt.startTime.toLocaleString(),
    }));

    return NextResponse.json(notifications);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
