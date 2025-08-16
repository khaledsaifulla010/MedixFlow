import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ids: string[] = body.ids;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "IDs required" }, { status: 400 });
    }

    await prisma.appointment.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to mark notifications" },
      { status: 500 }
    );
  }
}
