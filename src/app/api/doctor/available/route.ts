
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    const whereClause = doctorId ? { doctorId } : {};

    const availabilities = await prisma.doctorAvailability.findMany({
      where: whereClause,
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: availabilities });
  } catch (error) {
    console.error("Error fetching doctor availabilities:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctor availabilities" },
      { status: 500 }
    );
  }
}
