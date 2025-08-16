import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { prescriptionSchema } from "@/validation/prescriptionSchema";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
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
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = prescriptionSchema.parse(body);

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId: validated.appointmentId,
        advice: validated.advice,
        followUp: validated.followUp,
        items: { create: validated.items },
      },
      include: { items: true },
    });

    return NextResponse.json({ data: prescription });
  } catch (error: any) {
    console.error("Prescription creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyToken();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(req.url);
    const appointmentId = url.searchParams.get("appointmentId") || undefined;
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, role: true },
    });
    if (!user) return NextResponse.json([], { status: 200 });
    const includeTree = {
      items: true,
      appointment: {
        include: {
          doctor: { include: { user: true } },
          patient: { include: { user: true } },
        },
      },
    } as const;

    if (appointmentId) {
      const prescriptions = await prisma.prescription.findMany({
        where: { appointmentId },
        include: includeTree,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(prescriptions);
    }

    if (user.role === "patient") {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!patient) return NextResponse.json([], { status: 200 });

      const prescriptions = await prisma.prescription.findMany({
        where: { appointment: { patientId: patient.id } },
        include: includeTree,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(prescriptions);
    }

    if (user.role === "doctor") {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!doctor) return NextResponse.json([], { status: 200 });

      const prescriptions = await prisma.prescription.findMany({
        where: { appointment: { doctorId: doctor.id } },
        include: includeTree,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(prescriptions);
    }
    return NextResponse.json([]);
  } catch (error: any) {
    console.error("Prescription fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
