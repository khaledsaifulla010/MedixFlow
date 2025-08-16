import { NextRequest, NextResponse } from "next/server";
import { generatePatientId } from "@/lib/generatePatientId";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const userId = formData.get("userId") as string;
    const allergies = formData.get("allergies") as string;
    const pastTreatments = formData.get("pastTreatments") as string;

    const files = formData.getAll("files") as File[];
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const fileUrls: string[] = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      fileUrls.push(`/uploads/${filename}`);
    }

    let profile = await prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.patientProfile.create({
        data: {
          id: crypto.randomUUID(),
          userId,
        },
      });
    }

    const history = await prisma.medicalHistory.create({
      data: {
        patientProfileId: profile.id,
        allergies,
        pastTreatments,
        files: fileUrls,
      },
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("Error creating medical history:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, data: [] });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patientProfile) {
      return NextResponse.json({ success: false, data: [] });
    }

    const histories = await prisma.medicalHistory.findMany({
      where: { patientProfileId: patientProfile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: histories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, data: [] });
  }
}
