import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get all users with role "doctor" including their profile and availabilities
    const doctors = await prisma.user.findMany({
      where: { role: "doctor" },
      include: {
        doctorProfile: {
          include: { availabilities: true },
        },
      },
    });

    // Format response
    const response = doctors.map((doc) => ({
      id: doc.id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      dob: doc.dob,
      speciality: doc.doctorProfile?.speciality,
      degree: doc.doctorProfile?.degree,
      availabilities: doc.doctorProfile?.availabilities ?? [],
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Fetch available doctors error:", error);
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
