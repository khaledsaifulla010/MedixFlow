import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;
    const { doctorId, startTime, endTime } = await req.json();
    const start = new Date(startTime);
    const end = new Date(endTime);

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
    });
    if (!doctor)
      return NextResponse.json({ error: "Doctor not found" }, { status: 400 });

    const patient = await prisma.patientProfile.findUnique({
      where: { userId },
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

    if (!availabilities.length)
      return NextResponse.json(
        { error: "Doctor not available" },
        { status: 400 }
      );

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
        { error: "Selected time is outside doctor's availability" },
        { status: 400 }
      );

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (conflict)
      return NextResponse.json(
        { error: "Slot already booked" },
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

    return NextResponse.json(appointment);
  } catch (err) {
    console.error("POST /api/appointments error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// export async function GET() {
//   try {
//     const appointments = await prisma.appointment.findMany({
//       include: {
//         doctor: {
//           select: {
//             id: true,
//             speciality: true,
//             degree: true,
//             user: {
//               select: {
//                 name: true,
//                 email: true,
//                 phone: true,
//               },
//             },
//           },
//         },
//         patient: {
//           select: {
//             id: true,

//             user: {
//               select: {
//                 name: true,
//                 email: true,
//                 phone: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     const availabilities = await prisma.doctorAvailability.findMany({
//       include: {
//         doctor: {
//           select: {
//             id: true,
//             speciality: true,
//             user: { select: { name: true } },
//           },
//         },
//       },
//     });

//     return NextResponse.json({ appointments, availabilities });
//   } catch (err) {
//     console.error("GET /api/patient/appointments error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }


export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          select: {
            id: true,
            speciality: true,
            degree: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    const availabilities = await prisma.doctorAvailability.findMany({
      select: {
        id: true,
        doctorId: true, // ✅ ensure available directly
        isRecurring: true,
        dayOfWeek: true,
        date: true,
        startTime: true,
        endTime: true,
        doctor: {
          select: {
            id: true,
            speciality: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    // ✅ Convert date strings to Date objects
    const formattedAvailabilities = availabilities.map((a) => ({
      ...a,
      date: a.date ? new Date(a.date) : null,
    }));

    return NextResponse.json({
      appointments,
      availabilities: formattedAvailabilities,
    });
  } catch (err) {
    console.error("GET /api/patient/appointments error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

