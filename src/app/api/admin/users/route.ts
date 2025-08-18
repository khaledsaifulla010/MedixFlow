import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET USERS
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        role: true,
        createdAt: true,
        doctorProfile: {
          select: {
            id: true,
            speciality: true,
            degree: true,
            createdAt: true,
            _count: {
              select: {
                appointments: true,
                availabilities: true,
              },
            },
          },
        },
        patientProfile: {
          select: {
            id: true,
            createdAt: true,
            _count: {
              select: {
                histories: true,
                appointments: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: users }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/users] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

