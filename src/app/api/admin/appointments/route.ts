import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function verifyAdmin() {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
    };
    if (decoded.role !== "admin") return { error: "Forbidden", status: 403 };
    return { userId: decoded.id };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET() {
  const auth = await verifyAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const appointments = await prisma.appointment.findMany({
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } },
    },
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json({ data: appointments });
}
