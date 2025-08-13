import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  // Get access token from cookies
  const cookieHeader = req.headers.get("cookie");
  const accessToken = cookieHeader
    ?.split("; ")
    .find((c) => c.startsWith("accessToken="))
    ?.split("=")[1];

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify JWT token
    const payload = jwt.verify(accessToken, SECRET) as {
      id: string;
      role: string;
    };

    // Ensure the user is a doctor
    if (payload.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch doctor user + profile + availabilities
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        doctorProfile: {
          include: { availabilities: true },
        },
      },
    });

    if (!user || !user.doctorProfile) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      speciality: user.doctorProfile.speciality,
      degree: user.doctorProfile.degree,
      availabilities: user.doctorProfile.availabilities,
    });
  } catch (error: any) {
    console.error("Fetch current doctor error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
